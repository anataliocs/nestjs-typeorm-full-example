import type { Network, PlatformLoader } from '@wormhole-foundation/sdk';

export interface WormholeSdkConfig {
  /*
   * Wormhole network selection. 'Testnet' || 'Devnet' || 'Mainnet'
   * https://wormhole.com/docs/tools/typescript-sdk/get-started/#initialize-the-sdk
   */
  wormholeNetwork: Network;
  /*
   * Array of supported platforms.
   * https://wormhole.com/docs/products/reference/chain-ids/
   */
  platformArray: PlatformLoader<any>[];
}

export type WormholeConfigDataTypes = Network | PlatformLoader<any>[];
