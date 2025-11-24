import { ChainType } from '@peaq-network/sdk/src/types/common';
import type { Network, PlatformLoader } from '@wormhole-foundation/sdk';

/*type SupportedChains =
  | 'Btc'
  | 'Evm'
  | 'Sui'
  | 'Near'
  | 'Aptos'
  | 'Algorand'
  | 'Cosmwasm'
  | 'Solana'
  | 'Stacks';*/

export interface WormholeConfig {
  config: [
    {
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
    },
  ];
}

export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';

export type PeaqConfigDataTypes = string | ChainType;
