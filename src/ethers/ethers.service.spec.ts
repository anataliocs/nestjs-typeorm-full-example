import { Test, TestingModule } from '@nestjs/testing';
import { EthersService } from './ethers.service';
import { EthersSdkService } from '../etherssdk/ethers.sdk.service';
import { ConfigService } from '@nestjs/config';
import { EthersSdkConfig } from '../etherssdk/ethersSdkConfig';
import { firstValueFrom } from 'rxjs';
import { BlockNumber } from './dto/block-number';
import { WsResponse } from '@nestjs/websockets';

describe('EthersService', () => {
  let service: EthersService;
  let ethersSdkService: EthersSdkService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EthersService,
        EthersSdkService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => 'https://mainnet.infura.io/v3/'),
          },
        },
      ],
    })
      .useMocker((token) => {
        if (token === 'CONFIG_OPTIONS') {
          return jest.fn().mockReturnValue({
            rpcServerUrl: 'https://mainnet.infura.io/v3/',
            network: 'Testnet',
          } as EthersSdkConfig);
        }
      })
      .compile();

    service = module.get<EthersService>(EthersService);
    ethersSdkService = module.get<EthersSdkService>(EthersSdkService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(ethersSdkService).toBeDefined();
    expect(configService).toBeDefined();
  });

  it('serverStatus() response should be defined', () => {
    const ethersSdkMock = jest
      .spyOn(ethersSdkService, 'rpcServerStatus', 'get')
      .mockReturnValue('Connected');

    const status: string = service.serverStatusForApi();
    expect(status).toBeDefined();
    expect(ethersSdkMock).toHaveBeenCalledTimes(1);
    expect(status).toBe('Connected');
  });

  it('blockNumber() response should be defined', async () => {
    const ethersSdkMock = jest
      .spyOn(ethersSdkService, 'getBlockNumber')
      .mockReturnValue(Promise.resolve(123456789));

    const blockNumber: BlockNumber = await firstValueFrom(
      service.blockNumberForApi(),
    );
    expect(blockNumber).toBeDefined();
    expect(ethersSdkMock).toHaveBeenCalledTimes(1);
    expect(blockNumber).toHaveProperty('blockNumber', 123456789);
  });

  describe('finalizedBlockForApi() response should be defined', () => {
    it('should emit FinalizedBlock DTO when SDK returns a block', async () => {
      const sdkBlock = {
        number: 987654321,
        date: '2025-12-31T23:59:59Z',
        hash: '0xabc',
      } as unknown;

      const ethersSdkMock = jest
        .spyOn(ethersSdkService, 'getFinalizedBlock')
        // cast to never to satisfy the generic mock typing while avoiding any
        .mockResolvedValue(sdkBlock as never);

      const dto = await firstValueFrom(service.finalizedBlockForApi());
      expect(ethersSdkMock).toHaveBeenCalledTimes(1);
      expect(dto).toEqual({
        blockNumber: 987654321,
        date: '2025-12-31T23:59:59Z',
        hash: '0xabc',
      });
    });

    it('should emit an empty object when SDK returns null', async () => {
      const ethersSdkMock = jest
        .spyOn(ethersSdkService, 'getFinalizedBlock')
        .mockResolvedValue(null as never);

      const dto = await firstValueFrom(service.finalizedBlockForApi());
      expect(ethersSdkMock).toHaveBeenCalledTimes(1);
      expect(dto).toEqual({});
    });
  });

  describe('getBlockByNumberForGraphQL()', () => {
    it('should emit mapped Block model when SDK returns a block', async () => {
      const sdkBlock = {
        number: 777,
        date: '2026-01-01T00:00:00Z',
        hash: '0xdef',
        length: 12,
        nonce: '0x01',
      } as unknown;

      const ethersSdkMock = jest
        .spyOn(ethersSdkService, 'getBlock')
        .mockResolvedValue(sdkBlock as never);

      const model = await firstValueFrom(
        service.getBlockByNumberForGraphQL(777),
      );
      expect(ethersSdkMock).toHaveBeenCalledWith(777);
      expect(model).toEqual({
        creationDate: '2026-01-01T00:00:00Z',
        blockNumber: 777,
        hash: '0xdef',
        transactionCount: 12,
        nonce: '0x01',
      });
    });

    it('should emit an empty object when SDK returns null', async () => {
      const ethersSdkMock = jest
        .spyOn(ethersSdkService, 'getBlock')
        .mockResolvedValue(null as never);

      const model = await firstValueFrom(
        service.getBlockByNumberForGraphQL(12345),
      );
      expect(ethersSdkMock).toHaveBeenCalledWith(12345);
      expect(model).toEqual({});
    });
  });

  describe('internal wrappers', () => {
    it('_getBlockNumberJson should map number to DTO', async () => {
      const ethersSdkMock = jest
        .spyOn(ethersSdkService, 'getBlockNumber')
        .mockResolvedValue(654321);

      const dto = await service._getBlockNumberJson();
      expect(ethersSdkMock).toHaveBeenCalledTimes(1);
      expect(dto).toEqual({ blockNumber: 654321 });
    });

    it('_getFinalizedBlocksJson should map block to DTO', async () => {
      const sdkBlock = {
        number: 10,
        date: '2025-01-01T00:00:00Z',
        hash: '0xaaa',
      } as unknown;

      jest
        .spyOn(ethersSdkService, 'getFinalizedBlock')
        .mockResolvedValue(sdkBlock as never);

      const dto = await service._getFinalizedBlocksJson();
      expect(dto).toEqual({
        blockNumber: 10,
        date: '2025-01-01T00:00:00Z',
        hash: '0xaaa',
      });
    });

    it('_getFinalizedBlocksJson should return empty object on null', async () => {
      jest
        .spyOn(ethersSdkService, 'getFinalizedBlock')
        .mockResolvedValue(null as never);

      const dto = await service._getFinalizedBlocksJson();
      expect(dto).toEqual({});
    });

    it('_getBlockByNumberGraphQL should map block to model', async () => {
      const sdkBlock = {
        number: 42,
        date: '2024-06-01T12:00:00Z',
        hash: '0xbbb',
        length: 5,
        nonce: '0x02',
      } as unknown;

      jest
        .spyOn(ethersSdkService, 'getBlock')
        .mockResolvedValue(sdkBlock as never);

      const model = await service._getBlockByNumberGraphQL(42);
      expect(model).toEqual({
        creationDate: '2024-06-01T12:00:00Z',
        blockNumber: 42,
        hash: '0xbbb',
        transactionCount: 5,
        nonce: '0x02',
      });
    });

    it('_getBlockByNumberGraphQL should return empty object on null', async () => {
      jest.spyOn(ethersSdkService, 'getBlock').mockResolvedValue(null as never);
      const model = await service._getBlockByNumberGraphQL(99);
      expect(model).toEqual({});
    });
  });

  describe('WebSocket streams', () => {
    it('newBlocksStreamForWebsocket should emit WsResponse with BlockNumber data', async () => {
      jest.spyOn(ethersSdkService, 'getBlockNumber').mockResolvedValue(77);

      const streamFactory = service.newBlocksStreamForWebsocket();
      const res = await firstValueFrom(streamFactory(1));
      expect(res).toEqual({ type: 'events', data: { blockNumber: 77 } });
    });

    it('finalizedBlocksStreamForWebsocket should emit WsResponse with FinalizedBlock data', async () => {
      const sdkBlock = {
        number: 222,
        date: '2025-05-05T05:05:05Z',
        hash: '0xccc',
      } as unknown;
      jest
        .spyOn(ethersSdkService, 'getFinalizedBlock')
        .mockResolvedValue(sdkBlock as never);

      const streamFactory = service.finalizedBlocksStreamForWebsocket();
      const res = (await firstValueFrom(
        streamFactory(2),
      )) as WsResponse<unknown>;
      expect(res).toEqual({
        type: 'events',
        data: { blockNumber: 222, date: '2025-05-05T05:05:05Z', hash: '0xccc' },
      });
    });

    it('finalizedBlocksStreamForWebsocket should emit empty object data on null', async () => {
      jest
        .spyOn(ethersSdkService, 'getFinalizedBlock')
        .mockResolvedValue(null as never);

      const streamFactory = service.finalizedBlocksStreamForWebsocket();
      const res = await firstValueFrom(streamFactory(3));
      expect(res).toEqual({ type: 'events', data: {} });
    });
  });

  describe('SSE streams', () => {
    it('subscribeToNewBlocksForSse should emit MessageEvent with BlockNumber data', async () => {
      jest.spyOn(ethersSdkService, 'getBlockNumber').mockResolvedValue(88);

      const sseFactory = service.subscribeToNewBlocksForSse();
      const res = await firstValueFrom(sseFactory(5));
      expect(res).toEqual({
        type: 'message',
        id: 5,
        data: { blockNumber: 88 },
        retry: 0,
      });
    });

    it('subscribeToFinalizedBlocksForSse should emit MessageEvent with FinalizedBlock data', async () => {
      const sdkBlock = {
        number: 333,
        date: '2025-06-06T06:06:06Z',
        hash: '0xddd',
      } as unknown;
      jest
        .spyOn(ethersSdkService, 'getFinalizedBlock')
        .mockResolvedValue(sdkBlock as never);

      const sseFactory = service.subscribeToFinalizedBlocksForSse();
      const res = (await firstValueFrom(
        sseFactory(6),
      )) as MessageEvent<unknown>;
      expect(res).toEqual({
        type: 'message',
        id: 6,
        data: { blockNumber: 333, date: '2025-06-06T06:06:06Z', hash: '0xddd' },
        retry: 0,
      });
    });

    it('subscribeToFinalizedBlocksForSse should emit empty object data on null', async () => {
      jest
        .spyOn(ethersSdkService, 'getFinalizedBlock')
        .mockResolvedValue(null as never);

      const sseFactory = service.subscribeToFinalizedBlocksForSse();
      const res = await firstValueFrom(sseFactory(7));
      expect(res).toEqual({ type: 'message', id: 7, data: {}, retry: 0 });
    });
  });
});
