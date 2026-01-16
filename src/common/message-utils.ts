import { WebSocketSubscribeDto } from './dto/websocket-subscribe.dto';
import { of } from 'rxjs';
import { WsResponse } from '@nestjs/websockets';

export type WsError = {
  message: string;
};

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

/**
 * Build Websocket Response `WsResponse` object setting `data` to the return value
 * of the `sdkFunction` wrapper around an ethers SDK function.
 * `DataType` generic indicates the DTO type to be returned.
 *
 * @returns  `Promise<WsResponse<DataType>>`
 */
export async function buildWsResponse<DataType>(
  n: number,
  sdkFunction: () => Promise<DataType>,
): Promise<WsResponse<DataType>> {
  return {
    type: 'events',
    data: await sdkFunction(),
  } as unknown as WsResponse<DataType>;
}

export function errorMsgWsResponse(payload: WebSocketSubscribeDto) {
  return of({
    event: 'error',
    data: {
      message: `Invalid topic: ${payload.topic}`,
    } as WsError,
  } as unknown as WsResponse<WsError>);
}
