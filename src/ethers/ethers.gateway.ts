import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';

import { from, map, Observable } from 'rxjs';
import { Server } from 'ws';

@WebSocketGateway(81, { cors: { origin: '*' } })
export class EthersGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(EthersGateway.name);

  @WebSocketServer() server: Server;

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string): void {
    this.logger.log(`Received message from client ${data}`);
    // Emit the received message back to all connected clients
  }

  @SubscribeMessage('events')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onEvent(@MessageBody() _data: unknown): Observable<WsResponse<number>> {
    const event = 'events';
    const response = [1, 2, 3];

    this.logger.log(`Received message from client`);

    return from(response).pipe(map((data) => ({ event, data })));
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
