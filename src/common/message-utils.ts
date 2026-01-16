/**
 * Build SSE Response `MessageEvent` object setting `data` to the return value
 * of the `sdkFunction` wrapper around an ethers SDK function.
 * `DataType` generic indicates the DTO type to be returned.
 *
 * @returns  `Promise<MessageEvent<DataType>>`
 */
export async function buildMessageEvent<DataType>(
  n: number,
  sdkFunction: () => Promise<DataType>,
): Promise<MessageEvent<DataType>> {
  return {
    type: 'message',
    id: n,
    data: await sdkFunction(),
    retry: 0,
  } as unknown as MessageEvent<DataType>;
}
