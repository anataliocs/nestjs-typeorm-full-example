export class ChainConfigDto {
  chainId: number;
  rpc: string;
  platform: string;
  network: string;
  blockTime: number;
  finality: number;
  nativeTokenDecimals: number;
  coreBridgeAddress: string;
  wrappedNativeSymbol: string;
}
