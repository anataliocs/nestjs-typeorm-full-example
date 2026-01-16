import {
  Address,
  Base58EncodedBytes,
  Base64EncodedDataResponse,
  Blockhash,
  Lamports,
  Reward,
  Slot,
  TokenBalance,
  TransactionError,
  TransactionForFullMetaInnerInstructionsUnparsed,
  TransactionStatus,
  UnixTimestamp,
} from '@solana/kit';

export type RawSdkSolanaBlock = Readonly<{
  blockHeight: bigint;
  blockTime: UnixTimestamp;
  blockhash: Blockhash;
  parentSlot: Slot;
  previousBlockhash: Blockhash;
}> &
  Readonly<{ rewards: readonly Reward[] }> &
  Readonly<{
    transactions: readonly Readonly<{
      meta:
        | ((Readonly<{
            computeUnitsConsumed?: bigint;
            logMessages: readonly string[] | null;
            returnData?: {
              data: Base64EncodedDataResponse;
              programId: Address;
            };
            rewards: readonly Reward[] | null;
          }> &
            Readonly<{
              err: TransactionError | null;
              fee: Lamports;
              postBalances: readonly Lamports[];
              postTokenBalances?: readonly TokenBalance[];
              preBalances: readonly Lamports[];
              preTokenBalances?: readonly TokenBalance[];
              status: TransactionStatus;
            }>) &
            TransactionForFullMetaInnerInstructionsUnparsed &
            Readonly<{
              loadedAddresses: {
                readonly: readonly Address[];
                writable: readonly Address[];
              };
            }>)
        | null;
      transaction: Readonly<{
        message: {
          addressTableLookups?:
            | readonly Readonly<{
                accountKey: Address;
                readonlyIndexes: readonly number[];
                writableIndexes: readonly number[];
              }>[]
            | null;
        };
      }> &
        (Readonly<{
          message: Readonly<{
            accountKeys: readonly Address[];
            instructions: readonly (Readonly<{ data: Base58EncodedBytes }> &
              Partial<Readonly<{ stackHeight: number }>> &
              Readonly<{
                accounts: readonly number[];
                programIdIndex: number;
              }>)[];
          }> &
            Readonly<{
              header: {
                numReadonlySignedAccounts: number;
                numReadonlyUnsignedAccounts: number;
                numRequiredSignatures: number;
              };
              recentBlockhash: Blockhash;
            }>;
        }> &
          Readonly<{ signatures: readonly Base58EncodedBytes[] }>);
      version: 0 | 'legacy';
    }>[];
  }>;
