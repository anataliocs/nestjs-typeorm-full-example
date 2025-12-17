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
import { BlockNumber, EthersService } from './ethers.service';
import { WebSocketSubscribeDto } from './dto/websocket-subscribe.dto';

@WebSocketGateway(81, { cors: { origin: '*' } })
export class EthersGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(EthersGateway.name);

  @WebSocketServer() server: Server;

  constructor(private readonly ethersService: EthersService) {}

  @SubscribeMessage('events')
  onEvent(
    @MessageBody(new ValidationPipe()) payload: WebSocketSubscribeDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ConnectedSocket() _client: WebSocket,
  ): Observable<WsResponse<BlockNumber>> {
    this.logger.log(
      `Received message from client: ${payload.client} for topic: ${payload.topic}`,
    );

    return interval(5000)
      .pipe(mergeMap(this.ethersService.webSocketNewBlocksStream()))
      .pipe(distinct(({ data }) => data.blockNumber));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDisconnect(_client: any) {
    this.logger.log(`Received Websocket Disconnect`);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(client: any, ..._args: any[]) {
    this.logger.log(`Connected Websocket`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  afterInit(_server: Server) {
    this.logger.log(`WebSocket Gateway Initialized`);
  }
}
