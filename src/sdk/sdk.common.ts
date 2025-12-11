import {
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';

export enum ServerStatus {
  Connected = 'Connected',
  NotConnected = 'Not Connected',
}

export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';

/**
 * Interface defining standard interfaces to implement for SDK services, including lifecycle hooks.
 *
 * @see [Lifecycle Events](https://docs.nestjs.com/fundamentals/lifecycle-events)
 *
 * @publicApi
 */
export interface SdkService extends OnApplicationShutdown, OnModuleInit {}

export class SdkServiceBase<Type> implements OnApplicationBootstrap {
  protected _rpcServer: Type;
  protected _rpcServerStatus: ServerStatus = ServerStatus.NotConnected;
  protected _checkServerMsg: string;

  protected constructor(checkServerMsg: string) {
    this._checkServerMsg = checkServerMsg;
  }

  get rpcServer(): Type {
    this.checkServerStarted();
    return this._rpcServer;
  }

  get rpcServerStatus(): string {
    return this._rpcServerStatus;
  }

  protected connected() {
    this._rpcServerStatus = ServerStatus.Connected;
  }
  protected disconnected() {
    this._rpcServerStatus = ServerStatus.NotConnected;
  }

  protected checkServerStarted() {
    if (!this._rpcServer || this._rpcServerStatus === ServerStatus.NotConnected)
      throw new Error(this._checkServerMsg);
  }

  onApplicationBootstrap() {
    this.checkServerStarted();
  }
}
