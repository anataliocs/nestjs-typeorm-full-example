import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { WsAdapter } from '@nestjs/platform-ws';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Wait } from 'testcontainers';
import {
  AnvilContainer,
  AnvilOptions,
  LogVerbosity,
  StartedAnvilContainer,
} from '@hellaweb3/foundryanvil-testcontainers-nodejs';
import {
  SolanaTestValidatorContainer,
  StartedSolanaTestValidatorContainer,
} from '@beeman/testcontainers';
import {
  StartedWiremockContainer,
  WiremockContainer,
} from '@hellaweb3/wiremock-testcontainers-nodejs';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let container: StartedPostgreSqlContainer;
  let anvil: StartedAnvilContainer;
  let solana: StartedSolanaTestValidatorContainer;
  let wiremock: StartedWiremockContainer;

  beforeAll(async () => {
    const [_container, _anvil, _solana, _wiremock] = await Promise.all([
      new PostgreSqlContainer('postgres:13.3-alpine')
        .withWaitStrategy(Wait.forListeningPorts())
        .start(),
      new AnvilContainer(
        new AnvilOptions().logs
          .verboseLogs(LogVerbosity.Five)
          .logs.jsonLogFormat()
          .account.withRandomMnemonic()
          .evm.autoImpersonate(),
      ).start(),
      new SolanaTestValidatorContainer().start(),
      new WiremockContainer().withMappings('./test/__mocks__/wiremock').start(),
    ]);

    container = _container;
    anvil = _anvil;
    solana = _solana;
    wiremock = _wiremock;

    process.env.POSTGRES_HOST = container.getHost();
    process.env.POSTGRES_PORT = container.getMappedPort(5432).toString();
    process.env.POSTGRES_USER = container.getUsername();
    process.env.POSTGRES_PW = container.getPassword();
    process.env.POSTGRES_DB = container.getDatabase();

    process.env.ETHERS_RPC_SERVER_URL = anvil.rpcUrl;
    process.env.ETHERS_RPC_API_KEY = '';

    process.env.SOLKIT_RPC_SERVER_URL = solana.url;
    process.env.SOLKIT_WS_SERVER_URL = solana.urlWs;
    process.env.SOLKIT_RPC_PROVIDER_KEY_PREFIX = '';
    process.env.SOLKIT_RPC_API_KEY = '';

    process.env.REAP_BASE_URL = wiremock.rpcUrl;
  }, 60000);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableVersioning({
      type: VersioningType.URI,
    });
    app.useWebSocketAdapter(new WsAdapter(app));
    await app.init();
  });

  afterAll(async () => {
    await Promise.allSettled([
      app?.close(),
      container?.stop(),
      anvil?.stop(),
      solana?.stop(),
      wiremock?.stop(),
    ]);
  });

  it('testcontainers should be defined', () => {
    expect(container).toBeDefined();
    expect(anvil).toBeDefined();
    expect(solana).toBeDefined();
    expect(wiremock).toBeDefined();
  });

  it('/ethers/server-status (GET)', () => {
    return request(app.getHttpServer())
      .get('/v1/ethers/server-status')
      .expect(200)
      .expect('Connected');
  });

  it('/ethers/block-number (GET)', () => {
    return request(app.getHttpServer())
      .get('/v1/ethers/block-number')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('blockNumber');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(typeof res.body.blockNumber).toBe('number');
      });
  });

  it('/ethers/finalized-block (GET)', () => {
    return request(app.getHttpServer())
      .get('/v1/ethers/finalized-block')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('blockNumber');
        expect(res.body).toHaveProperty('date');
        expect(res.body).toHaveProperty('hash');
      });
  });
});
