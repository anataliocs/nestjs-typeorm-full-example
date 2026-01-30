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
import { EthersService } from './ethers.service';
import { WebSocketSubscribeDto } from '../common/dto/websocket-subscribe.dto';
import { BlockNumber } from './dto/block-number';
import { FinalizedBlock } from './dto/finalized-block';
import { IncomingMessage } from 'node:http';
import { errorMsgWsResponse, WsError } from '../common/message-utils';

@WebSocketGateway({ cors: { origin: '*' } })
export class EthersGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(EthersGateway.name);

  @WebSocketServer() server: Server;

  constructor(private readonly ethersService: EthersService) {}

  @SubscribeMessage('ethers-subscribe-blocks')
  onEvent(
    @MessageBody(new ValidationPipe()) payload: WebSocketSubscribeDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ConnectedSocket() _client: WebSocket,
  ): Observable<WsResponse<BlockNumber | FinalizedBlock | WsError>> {
    this.logger.log(
      `Event: ethers-subscribe-blocks Client: ${payload.client} Topic: ${payload.topic}`,
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
      .pipe(mergeMap(this.ethersService.finalizedBlocksStreamForWebsocket()))
      .pipe(distinct(({ data }) => data.blockNumber));
  }

  private newBlocksStream() {
    return interval(5000)
      .pipe(mergeMap(this.ethersService.newBlocksStreamForWebsocket()))
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
