import { Test } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import request from 'supertest';
import { App } from 'supertest/types';
import { Server } from 'node:http';
import { AddressInfo } from 'node:net';
import WebSocket from 'ws';
import { Network, StartedNetwork, Wait } from 'testcontainers';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import {
  SolanaTestValidatorContainer,
  StartedSolanaTestValidatorContainer,
} from '@beeman/testcontainers';
import {
  AnvilContainer,
  AnvilOptions,
  useAnvil,
} from '@hellaweb3/foundryanvil-testcontainers-nodejs';
import {
  StartedWiremockContainer,
  WiremockContainer,
} from '@hellaweb3/wiremock-testcontainers-nodejs';
import { AppModule } from '../src/app.module';
import {
  addStubs,
  ANVIL_ALIAS,
  callsTo,
  failCallsTo,
  PROXY_TO_ANVIL,
  recordedRpcCalls,
  RPC_PATH,
} from './support/rpc-faults';

/** Genesis timestamp, so block dates are deterministic. */
const GENESIS = new Date('2025-01-01T00:00:00.000Z');

/**
 * anvil derives `finalized` as `head − 2 · slotsInAnEpoch` (clamped at
 * genesis). One slot per epoch makes finality lag the head by two blocks.
 */
const SLOTS_IN_AN_EPOCH = 1;
const FINALITY_LAG = 2 * SLOTS_IN_AN_EPOCH;

/** The SSE controller and WebSocket gateway poll the node every 5 s. */
const STREAM_TICK_MS = 5_000;

const ONE_GWEI = 1_000_000_000n;

/** Nest's default body for an unhandled (non-HTTP) exception. */
const INTERNAL_SERVER_ERROR = {
  statusCode: 500,
  message: 'Internal server error',
};

interface FinalizedBlockJson {
  blockNumber?: number;
  date?: string;
  hash?: string;
}

interface GraphQLBlock {
  blockNumber: string;
  creationDate: string;
  hash: string;
  nonce: string;
  transactionCount: number;
}

interface GraphQLResponse {
  data?: { getBlockByNumber: GraphQLBlock } | null;
  errors?: { message: string }[];
}

const BLOCK_QUERY = /* GraphQL */ `
  query Block($blockNumber: Float!) {
    getBlockByNumber(blockNumber: $blockNumber) {
      blockNumber
      creationDate
      hash
      nonce
      transactionCount
    }
  }
`;

describe('Ethers API (e2e)', () => {
  let network: StartedNetwork;
  let postgres: StartedPostgreSqlContainer;
  let solana: StartedSolanaTestValidatorContainer;
  let wiremock: StartedWiremockContainer;

  // One anvil node for the file: started in beforeAll, snapshot-restored after
  // every test (mined blocks, time travel, reorgs never leak), stopped in afterAll.
  // It joins a Docker network so that WireMock can proxy to it as `anvil:8545`.
  const anvil = useAnvil({
    start: async () => {
      network = await new Network().start();
      return new AnvilContainer(
        new AnvilOptions().account
          .withAccounts(3)
          .state.withTimestamp(GENESIS)
          .mining.withSlotsInAnEpoch(SLOTS_IN_AN_EPOCH)
          .logs.jsonLogFormat(),
      )
        .withTestClient((client) => client.withAccount(0))
        .withNetwork(network)
        .withNetworkAliases(ANVIL_ALIAS)
        .start();
    },
  });

  beforeAll(async () => {
    [postgres, solana, wiremock] = await Promise.all([
      new PostgreSqlContainer('postgres:13.3-alpine')
        .withWaitStrategy(Wait.forListeningPorts())
        .start(),
      new SolanaTestValidatorContainer().start(),
      new WiremockContainer()
        .withNetwork(network)
        .withMappings('./test/__mocks__/wiremock') // recorded Reap API
        .withMapping('json-rpc/proxy-to-anvil', { json: PROXY_TO_ANVIL })
        .start(),
    ]);
    await wiremock.waitUntilReady();

    process.env.POSTGRES_HOST = postgres.getHost();
    process.env.POSTGRES_PORT = postgres.getMappedPort(5432).toString();
    process.env.POSTGRES_USER = postgres.getUsername();
    process.env.POSTGRES_PW = postgres.getPassword();
    process.env.POSTGRES_DB = postgres.getDatabase();

    process.env.ETHERS_RPC_API_KEY = '';

    process.env.SOLKIT_RPC_SERVER_URL = solana.url;
    process.env.SOLKIT_WS_SERVER_URL = solana.urlWs;
    process.env.SOLKIT_RPC_PROVIDER_KEY_PREFIX = '';
    process.env.SOLKIT_RPC_API_KEY = '';

    process.env.REAP_BASE_URL = wiremock.rpcUrl;
  }, 120_000);

  const apps: INestApplication<App>[] = [];
  const sockets: WebSocket[] = [];

  afterEach(async () => {
    sockets.splice(0).forEach((socket) => socket.terminate());
    await Promise.all(apps.splice(0).map((app) => app.close()));
    await wiremock.reset(); // drop runtime fault stubs, clear the journal
  });

  afterAll(async () => {
    await Promise.allSettled([postgres?.stop(), solana?.stop()]);
    await wiremock?.stop();
  });

  /**
   * Boots the full application with its ethers provider pointed at anvil,
   * either directly or through the WireMock proxy.
   */
  async function createApp({
    via = 'anvil',
    listen = false,
  }: { via?: 'anvil' | 'proxy'; listen?: boolean } = {}): Promise<
    INestApplication<App>
  > {
    process.env.ETHERS_RPC_SERVER_URL =
      via === 'anvil' ? anvil.rpcUrl : wiremock.getUrl(RPC_PATH);

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleFixture.createNestApplication<INestApplication<App>>();
    app.enableVersioning({ type: VersioningType.URI });
    app.useWebSocketAdapter(new WsAdapter(app));
    apps.push(app);

    if (listen) {
      await app.listen(0);
    } else {
      await app.init();
    }
    return app;
  }

  const portOf = (app: INestApplication<App>): number =>
    ((app.getHttpServer() as unknown as Server).address() as AddressInfo).port;

  const blockAt = (blockNumber: bigint) =>
    anvil.testClient.getBlock({ blockNumber });

  const queryBlock = (app: INestApplication<App>, blockNumber: unknown) =>
    request(app.getHttpServer())
      .post('/graphql')
      .send({ query: BLOCK_QUERY, variables: { blockNumber } });

  /** Subscribes over WebSocket and hands out pushed messages in order. */
  async function subscribe(app: INestApplication<App>, topic: string) {
    const socket = new WebSocket(`ws://127.0.0.1:${portOf(app)}`);
    sockets.push(socket);
    const queued: unknown[] = [];
    const waiting: ((message: unknown) => void)[] = [];
    socket.on('message', (raw: WebSocket.RawData) => {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const message: unknown = JSON.parse(raw.toString());
      const resolve = waiting.shift();
      if (resolve) resolve(message);
      else queued.push(message);
    });
    await new Promise<void>((resolve, reject) => {
      socket.once('open', resolve);
      socket.once('error', reject);
    });
    socket.send(
      JSON.stringify({
        event: 'ethers-subscribe-blocks',
        data: { client: 'e2e', topic },
      }),
    );
    return {
      next: <T>(): Promise<T> =>
        queued.length > 0
          ? Promise.resolve(queued.shift() as T)
          : new Promise<T>((resolve) =>
              waiting.push(resolve as (message: unknown) => void),
            ),
    };
  }

  /** Reads the first Server-Sent Event of a stream, then disconnects. */
  async function firstSseEvent<T>(app: INestApplication<App>, path: string) {
    const controller = new AbortController();
    const res = await fetch(`http://127.0.0.1:${portOf(app)}${path}`, {
      signal: controller.signal,
    });
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    try {
      while (!buffer.includes('\n\n')) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
      }
    } finally {
      controller.abort();
    }
    const fields = Object.fromEntries(
      buffer
        .split('\n\n')[0]
        .split('\n')
        .map((line) => [
          line.slice(0, line.indexOf(':')),
          line.slice(line.indexOf(':') + 1).trim(),
        ]),
    );
    return {
      contentType: res.headers.get('content-type'),
      id: fields.id,
      data: JSON.parse(fields.data) as T,
    };
  }

  describe('against anvil directly', () => {
    describe('GET /v1/ethers/server-status', () => {
      it('reports the RPC connection established at startup', async () => {
        const app = await createApp();

        await request(app.getHttpServer())
          .get('/v1/ethers/server-status')
          .expect(200)
          .expect('Cache-Control', 'no-store')
          .expect('Connected');
      });
    });

    describe('GET /v1/ethers/block-number', () => {
      it('returns the genesis block on a fresh chain', async () => {
        const app = await createApp();

        await request(app.getHttpServer())
          .get('/v1/ethers/block-number')
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect('Cache-Control', 'no-store')
          .expect({ blockNumber: 0 });
      });

      it('follows the chain head as blocks are mined', async () => {
        await anvil.mine(25);
        const app = await createApp();

        await request(app.getHttpServer())
          .get('/v1/ethers/block-number')
          .expect(200)
          .expect({ blockNumber: 25 });
      });

      it('counts a block mined by a transaction', async () => {
        const [alice, bob] = await anvil.addresses();
        const receipt = await anvil.sendEthTransaction(alice, bob, '1');
        const app = await createApp();

        await request(app.getHttpServer())
          .get('/v1/ethers/block-number')
          .expect(200)
          .expect({ blockNumber: Number(receipt.blockNumber) });
      });
    });

    describe('GET /v1/ethers/finalized-block', () => {
      it('returns the genesis block with its hash and timestamp', async () => {
        const genesis = await blockAt(0n);
        const app = await createApp();

        await request(app.getHttpServer())
          .get('/v1/ethers/finalized-block')
          .expect(200)
          .expect('Content-Type', /application\/json/)
          .expect('Cache-Control', 'no-store')
          .expect({
            blockNumber: 0,
            date: GENESIS.toISOString(),
            hash: genesis.hash,
          });
      });

      it('stays on genesis until the head is past the finality lag', async () => {
        await anvil.mine(FINALITY_LAG - 1);
        const app = await createApp();

        const res = await request(app.getHttpServer())
          .get('/v1/ethers/finalized-block')
          .expect(200);

        expect((res.body as FinalizedBlockJson).blockNumber).toBe(0);
      });

      it('lags the chain head by the finality depth', async () => {
        await anvil.mine(10);
        const finalized = await anvil.testClient.getBlock({
          blockTag: 'finalized',
        });
        const app = await createApp();

        const res = await request(app.getHttpServer())
          .get('/v1/ethers/finalized-block')
          .expect(200);

        expect(res.body).toEqual({
          blockNumber: 10 - FINALITY_LAG,
          date: new Date(Number(finalized.timestamp) * 1000).toISOString(),
          hash: finalized.hash,
        });
        expect(finalized.number).toBe(BigInt(10 - FINALITY_LAG));
      });

      it('reports chain time, not wall-clock time, after time travel', async () => {
        const future = new Date('2030-01-01T00:00:00.000Z');
        // The first block jumps to 2030; FINALITY_LAG more blocks finalize it.
        await anvil.cheats.setNextBlockTimestamp(future).mine(1 + FINALITY_LAG);
        const app = await createApp();

        await request(app.getHttpServer())
          .get('/v1/ethers/finalized-block')
          .expect(200)
          .expect((res) => {
            const body = res.body as FinalizedBlockJson;
            expect(body.blockNumber).toBe(1);
            expect(body.date).toBe(future.toISOString());
          });
      });

      it('is unaffected by a reorg shallower than finality', async () => {
        const [alice, bob] = await anvil.addresses();
        await anvil.mine(10);
        const finalizedBefore = await anvil.testClient.getBlock({
          blockTag: 'finalized',
        });
        const headBefore = await blockAt(10n);

        // Replace the head block with one carrying a transaction.
        await anvil.testClient.reorg({
          depth: 1,
          transactions: [
            {
              transaction: { from: alice, to: bob, value: ONE_GWEI },
              block: 0,
            },
          ],
        });
        const headAfter = await blockAt(10n);
        const app = await createApp();

        const res = await request(app.getHttpServer())
          .get('/v1/ethers/finalized-block')
          .expect(200);

        expect(headAfter.hash).not.toBe(headBefore.hash);
        expect(res.body).toMatchObject({
          blockNumber: Number(finalizedBefore.number),
          hash: finalizedBefore.hash,
        });
      });

      it('follows the chain backwards after a rollback past finality', async () => {
        await anvil.mine(10);
        await anvil.testClient.rollback({ depth: 5 });
        const app = await createApp();

        await request(app.getHttpServer())
          .get('/v1/ethers/block-number')
          .expect(200)
          .expect({ blockNumber: 5 });
        const res = await request(app.getHttpServer())
          .get('/v1/ethers/finalized-block')
          .expect(200);

        expect(res.body).toMatchObject({
          blockNumber: 5 - FINALITY_LAG,
          hash: (await blockAt(BigInt(5 - FINALITY_LAG))).hash,
        });
      });
    });

    describe('GraphQL getBlockByNumber', () => {
      it('returns the genesis block', async () => {
        const genesis = await blockAt(0n);
        const app = await createApp();

        const res = await queryBlock(app, 0).expect(200);

        expect(res.body).toEqual({
          data: {
            getBlockByNumber: {
              blockNumber: '0',
              creationDate: GENESIS.toISOString(),
              hash: genesis.hash,
              nonce: '0x0000000000000000',
              transactionCount: 0,
            },
          },
        });
      });

      it('counts the transaction in the block that mined it', async () => {
        const [alice, bob] = await anvil.addresses();
        const receipt = await anvil.sendEthTransaction(alice, bob, '1');
        const app = await createApp();

        const res = await queryBlock(app, Number(receipt.blockNumber)).expect(
          200,
        );

        expect(
          (res.body as GraphQLResponse).data?.getBlockByNumber,
        ).toMatchObject({
          blockNumber: String(receipt.blockNumber),
          hash: receipt.blockHash,
          transactionCount: 1,
        });
      });

      it('counts several transactions batched into one block', async () => {
        const [, bob] = await anvil.addresses();
        await anvil.setAutomine(false);
        try {
          const hashes: `0x${string}`[] = [];
          for (let i = 0; i < 3; i++) {
            hashes.push(
              await anvil.testClient.sendTransaction({
                to: bob,
                value: ONE_GWEI,
              }),
            );
          }
          await anvil.mine();
          const receipts = await Promise.all(
            hashes.map((hash) => anvil.confirm(hash)),
          );
          expect(new Set(receipts.map((r) => r.blockNumber)).size).toBe(1);
          const app = await createApp();

          const res = await queryBlock(
            app,
            Number(receipts[0].blockNumber),
          ).expect(200);

          expect(
            (res.body as GraphQLResponse).data?.getBlockByNumber
              .transactionCount,
          ).toBe(3);
        } finally {
          await anvil.setAutomine(true); // not part of the snapshot
        }
      });

      it('resolves negative numbers relative to the head (ethers semantics)', async () => {
        await anvil.mine(3);
        const app = await createApp();

        const res = await queryBlock(app, -1).expect(200);

        expect(
          (res.body as GraphQLResponse).data?.getBlockByNumber.blockNumber,
        ).toBe('2');
      });

      it('errors for a block beyond the chain head', async () => {
        const app = await createApp();

        const res = await queryBlock(app, 1_000).expect(200);
        const body = res.body as GraphQLResponse;

        expect(body.data).toBeNull();
        expect(body.errors?.[0].message).toMatch(
          /Cannot return null for non-nullable field Block\./,
        );
      });

      it('errors for a fractional block number', async () => {
        const app = await createApp();

        const res = await queryBlock(app, 1.5).expect(200);
        const body = res.body as GraphQLResponse;

        expect(body.data).toBeNull();
        expect(body.errors).toHaveLength(1);
      });

      it('rejects a block number that is not a number', async () => {
        const app = await createApp();

        const res = await queryBlock(app, 'latest').expect(400);

        expect((res.body as GraphQLResponse).errors?.[0].message).toMatch(
          /\$blockNumber.*Float/,
        );
      });
    });

    describe('WebSocket ethers-subscribe-blocks', () => {
      it(
        'pushes the head, then each new head once blocks are mined',
        async () => {
          const app = await createApp({ listen: true });
          const stream = await subscribe(app, 'block-number');

          const first = await stream.next<{ data: unknown }>();
          expect(first.data).toEqual({ blockNumber: 0 });

          await anvil.mine(3);
          const second = await stream.next<{ data: unknown }>();
          expect(second.data).toEqual({ blockNumber: 3 });
        },
        3 * STREAM_TICK_MS + 5_000,
      );

      it(
        'pushes the finalized block',
        async () => {
          const genesis = await blockAt(0n);
          const app = await createApp({ listen: true });
          const stream = await subscribe(app, 'finalized-blocks');

          const first = await stream.next<{ data: unknown }>();
          expect(first.data).toEqual({
            blockNumber: 0,
            date: GENESIS.toISOString(),
            hash: genesis.hash,
          });
        },
        2 * STREAM_TICK_MS + 5_000,
      );

      it('answers an unknown topic with an error event', async () => {
        const app = await createApp({ listen: true });
        const stream = await subscribe(app, 'mempool');

        await expect(stream.next()).resolves.toEqual({
          event: 'error',
          data: { message: 'Invalid topic: mempool' },
        });
      });
    });

    describe('Server-Sent Events', () => {
      it(
        'streams the head on /ethers/sse/block-number',
        async () => {
          await anvil.mine(4);
          const app = await createApp({ listen: true });

          const event = await firstSseEvent<unknown>(
            app,
            '/ethers/sse/block-number',
          );

          expect(event.contentType).toMatch(/text\/event-stream/);
          expect(event.data).toEqual({ blockNumber: 4 });
        },
        2 * STREAM_TICK_MS + 5_000,
      );

      it(
        'streams the finalized block on /ethers/sse/finalized-blocks',
        async () => {
          await anvil.mine(4);
          const finalized = await blockAt(BigInt(4 - FINALITY_LAG));
          const app = await createApp({ listen: true });

          const event = await firstSseEvent<FinalizedBlockJson>(
            app,
            '/ethers/sse/finalized-blocks',
          );

          expect(event.data).toMatchObject({
            blockNumber: 4 - FINALITY_LAG,
            hash: finalized.hash,
          });
        },
        2 * STREAM_TICK_MS + 5_000,
      );
    });

    describe('routing', () => {
      it.each([
        ['GET', '/ethers/block-number'],
        ['GET', '/v2/ethers/block-number'],
        ['POST', '/v1/ethers/block-number'],
        ['GET', '/v1/ethers/block'],
      ])('%s %s is not found', async (method, path) => {
        const app = await createApp();
        const server = request(app.getHttpServer());

        await (method === 'GET' ? server.get(path) : server.post(path)).expect(
          404,
        );
      });
    });
  });

  describe('through a fault-injecting WireMock proxy', () => {
    it('is transparent: real anvil data, one RPC call per request', async () => {
      await anvil.mine(7);
      const finalized = await blockAt(BigInt(7 - FINALITY_LAG));
      const app = await createApp({ via: 'proxy' });
      await wiremock.resetRequests(); // ignore start-up network detection

      await request(app.getHttpServer())
        .get('/v1/ethers/block-number')
        .expect(200)
        .expect({ blockNumber: 7 });
      await request(app.getHttpServer())
        .get('/v1/ethers/finalized-block')
        .expect(200)
        .expect((res) =>
          expect(res.body).toMatchObject({
            blockNumber: 7 - FINALITY_LAG,
            hash: finalized.hash,
          }),
        );

      expect(await wiremock.countRequests(callsTo('eth_blockNumber'))).toBe(1);
      const calls = await recordedRpcCalls(wiremock);
      expect(calls.every((call) => call.jsonrpc === '2.0')).toBe(true);
      expect(
        calls
          .filter((call) => call.method === 'eth_getBlockByNumber')
          .map((call) => call.params),
      ).toEqual([['finalized', false]]);
    });

    it('fails with 500 and does not retry when the node returns 503', async () => {
      const app = await createApp({ via: 'proxy' });
      await addStubs(
        wiremock,
        failCallsTo('eth_blockNumber', {
          status: 503,
          body: 'Service Unavailable',
        }),
      );

      await request(app.getHttpServer())
        .get('/v1/ethers/block-number')
        .expect(500)
        .expect(INTERNAL_SERVER_ERROR);

      expect(await wiremock.countRequests(callsTo('eth_blockNumber'))).toBe(1);
    });

    it.each(['CONNECTION_RESET_BY_PEER', 'EMPTY_RESPONSE'])(
      'fails with 500 on a %s network fault',
      async (fault) => {
        const app = await createApp({ via: 'proxy' });
        await addStubs(wiremock, failCallsTo('eth_blockNumber', { fault }));

        await request(app.getHttpServer())
          .get('/v1/ethers/block-number')
          .expect(500)
          .expect(INTERNAL_SERVER_ERROR);
      },
    );

    it('fails with 500 on a malformed JSON-RPC body, other routes unaffected', async () => {
      await anvil.mine(2);
      const app = await createApp({ via: 'proxy' });
      await addStubs(
        wiremock,
        failCallsTo('eth_getBlockByNumber', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: '{"jsonrpc":"2.0",',
        }),
      );

      await request(app.getHttpServer())
        .get('/v1/ethers/finalized-block')
        .expect(500)
        .expect(INTERNAL_SERVER_ERROR);
      await request(app.getHttpServer())
        .get('/v1/ethers/block-number')
        .expect(200)
        .expect({ blockNumber: 2 });
    });

    it('tolerates a slow node', async () => {
      const delayMs = 1_500;
      await anvil.mine(4);
      const app = await createApp({ via: 'proxy' });
      await addStubs(
        wiremock,
        failCallsTo('eth_blockNumber', {
          ...PROXY_TO_ANVIL.response,
          fixedDelayMilliseconds: delayMs,
        }),
      );

      const started = Date.now();
      await request(app.getHttpServer())
        .get('/v1/ethers/block-number')
        .expect(200)
        .expect({ blockNumber: 4 });

      expect(Date.now() - started).toBeGreaterThanOrEqual(delayMs);
    });

    it('recovers from rate limiting by retrying after a 429', async () => {
      await anvil.mine(6);
      const app = await createApp({ via: 'proxy' });
      await addStubs(
        wiremock,
        failCallsTo(
          'eth_blockNumber',
          { status: 429, body: 'Too Many Requests' },
          {
            scenarioName: 'rate-limit',
            requiredScenarioState: 'Started',
            newScenarioState: 'recovered',
          },
        ),
      );

      await request(app.getHttpServer())
        .get('/v1/ethers/block-number')
        .expect(200)
        .expect({ blockNumber: 6 });

      expect(await wiremock.countRequests(callsTo('eth_blockNumber'))).toBe(2);
    });

    it('still reports Connected while every block call fails', async () => {
      await addStubs(
        wiremock,
        failCallsTo('eth_blockNumber', { status: 503 }),
        failCallsTo('eth_getBlockByNumber', { status: 503 }),
      );
      const app = await createApp({ via: 'proxy' });

      await request(app.getHttpServer())
        .get('/v1/ethers/block-number')
        .expect(500);
      await request(app.getHttpServer())
        .get('/v1/ethers/server-status')
        .expect(200)
        .expect('Connected');
    });
  });
});
