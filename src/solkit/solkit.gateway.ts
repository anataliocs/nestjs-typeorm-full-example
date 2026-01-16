import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Logger, ValidationPipe } from '@nestjs/common';

import { distinct, interval, mergeMap, Observable } from 'rxjs';
import { Server } from 'ws';
import { WebSocketSubscribeDto } from '../common/dto/websocket-subscribe.dto';
import { IncomingMessage } from 'node:http';
import { errorMsgWsResponse, WsError } from '../common/message-utils';
import { SolkitService } from './solkit.service';
import { SolanaBlockNumber } from './dto/solana-block-number';
import { SolanaFinalizedBlock } from './dto/solana-finalized-block';

@WebSocketGateway(81, { cors: { origin: '*' } })
export class SolkitGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(SolkitGateway.name);

  @WebSocketServer() server: Server;

  constructor(private readonly solkitService: SolkitService) {}

  @SubscribeMessage('solkit-subscribe-blocks')
  onEvent(
    @MessageBody(new ValidationPipe()) payload: WebSocketSubscribeDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ConnectedSocket() _client: WebSocket,
  ): Observable<
    WsResponse<SolanaBlockNumber | SolanaFinalizedBlock | WsError>
  > {
    this.logger.log(
      `Event: solkit-subscribe-blocks Client: ${payload.client} Topic: ${payload.topic}`,
    );

    switch (payload.topic) {
      case 'block-number':
        return this.newBlocksStream();
      case 'finalized-blocks':
        return this.finalizedBlocksStream();
      default:
        return errorMsgWsResponse(payload);
    }
  }

  private finalizedBlocksStream() {
    return interval(5000)
      .pipe(mergeMap(this.solkitService.finalizedBlocksStreamForWebsocket()))
      .pipe(distinct(({ data }) => data.blockNumber));
  }

  private newBlocksStream() {
    return interval(5000)
      .pipe(mergeMap(this.solkitService.newBlocksStreamForWebsocket()))
      .pipe(distinct(({ data }) => data.blockNumber));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDisconnect(_client: any) {
    this.logger.log(`Received Websocket Disconnect`);
  }

  handleConnection(client: any, ..._args: any[]) {
    const argsString = (_args[0] as IncomingMessage).rawHeaders.join(' ');
    this.logger.log(`Connected Websocket: ${argsString}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(_server: Server) {
    this.logger.log(`WebSocket Gateway Initialized`);
  }
}
