import { ChainType } from '@peaq-network/sdk/src/types/common';

export interface PeaqSdkConfig {
  /*
   * RPC/WSS URL used to connect to the blockchain.
   * https://docs.peaq.xyz/build/getting-started/connecting-to-peaq
   */
  rpcServerUrl: string;
  /*
   * EVM or Substrate transactions (defaults to Substrate).
   * Example: Sdk.ChainType.EVM
   */
  chainType: ChainType;
}
