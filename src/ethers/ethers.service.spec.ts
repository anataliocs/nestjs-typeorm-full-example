import { Test, TestingModule } from '@nestjs/testing';
import { EthersService } from './ethers.service';
import { EthersSdkService } from '../etherssdk/ethers.sdk.service';
import { ConfigService } from '@nestjs/config';
import { EthersSdkConfig } from '../etherssdk/ethersSdkConfig';
import { firstValueFrom } from 'rxjs';
import { BlockNumber } from './dto/block-number';
import { WsResponse } from '@nestjs/websockets';
import { mockBlock, mockFinalizedBlock } from './testutil/ethers.testhelper';

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
      const ethersSdkMock = jest
        .spyOn(ethersSdkService, 'getFinalizedBlock')
        .mockResolvedValue(mockFinalizedBlock as never);

      const block = await firstValueFrom(service.finalizedBlockForApi());
      expect(ethersSdkMock).toHaveBeenCalledTimes(1);
      expect(block).toEqual({
        blockNumber: 24198546,
        date: '2025-12-31T23:59:59Z',
        hash: '0x79834bd5e82e7fe3547bfb7721e3d3c3cf44718b26d724c5def08c23b8ab9f6a',
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
      const ethersSdkMock = jest
        .spyOn(ethersSdkService, 'getBlock')
        .mockResolvedValue(mockBlock as never);

      const model = await firstValueFrom(
        service.getBlockByNumberForGraphQL(24198547),
      );
      expect(ethersSdkMock).toHaveBeenCalledWith(24198547);
      expect(model).toEqual({
        creationDate: '2026-01-01T00:00:00Z',
        blockNumber: 24198547,
        hash: '0x79834bd5e82e7fe3547bfb7721e3d3c3cf44718b26d724c5def08c23b8ab9f6a',
        transactionCount: 480,
        nonce: '0x0000000000000000',
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
        .mockResolvedValue(24198547);

      const dto = await service._getBlockNumberJson();
      expect(ethersSdkMock).toHaveBeenCalledTimes(1);
      expect(dto).toEqual({ blockNumber: 24198547 });
    });

    it('_getFinalizedBlocksJson should map block to DTO', async () => {
      jest
        .spyOn(ethersSdkService, 'getFinalizedBlock')
        .mockResolvedValue(mockFinalizedBlock as never);

      const dto = await service._getFinalizedBlocksJson();
      expect(dto).toEqual({
        blockNumber: 24198546,
        date: '2025-12-31T23:59:59Z',
        hash: '0x79834bd5e82e7fe3547bfb7721e3d3c3cf44718b26d724c5def08c23b8ab9f6a',
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
      jest
        .spyOn(ethersSdkService, 'getBlock')
        .mockResolvedValue(mockBlock as never);

      const model = await service._getBlockByNumberGraphQL(42);
      expect(model).toEqual({
        creationDate: '2026-01-01T00:00:00Z',
        blockNumber: 24198547,
        hash: '0x79834bd5e82e7fe3547bfb7721e3d3c3cf44718b26d724c5def08c23b8ab9f6a',
        transactionCount: 480,
        nonce: '0x0000000000000000',
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
      jest
        .spyOn(ethersSdkService, 'getFinalizedBlock')
        .mockResolvedValue(mockFinalizedBlock as never);

      const streamFactory = service.finalizedBlocksStreamForWebsocket();
      const res = (await firstValueFrom(
        streamFactory(2),
      )) as WsResponse<unknown>;
      expect(res).toEqual({
        type: 'events',
        data: {
          blockNumber: 24198546,
          date: '2025-12-31T23:59:59Z',
          hash: '0x79834bd5e82e7fe3547bfb7721e3d3c3cf44718b26d724c5def08c23b8ab9f6a',
        },
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
      jest
        .spyOn(ethersSdkService, 'getFinalizedBlock')
        .mockResolvedValue(mockFinalizedBlock as never);

      const sseFactory = service.subscribeToFinalizedBlocksForSse();
      const res = (await firstValueFrom(
        sseFactory(6),
      )) as MessageEvent<unknown>;
      expect(res).toEqual({
        type: 'message',
        id: 6,
        data: {
          blockNumber: 24198546,
          date: '2025-12-31T23:59:59Z',
          hash: '0x79834bd5e82e7fe3547bfb7721e3d3c3cf44718b26d724c5def08c23b8ab9f6a',
        },
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
