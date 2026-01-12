export interface SolkitSdkConfig {
  /*
   * RPC URL used to connect to the blockchain.
   * https://www.solanakit.com/docs/getting-started/setup#create-a-client-object
   */
  rpcServerUrl: string;

  /*
   * WSS URL used to subscribe to the blockchain.
   * https://www.solanakit.com/docs/getting-started/setup#create-a-client-object
   */
  wsServerUrl: string;
  /*
   * TODO
   * Example: TODO
   */
  network: string;
}
