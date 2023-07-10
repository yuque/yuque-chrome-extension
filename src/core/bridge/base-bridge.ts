import { MapT } from '@/common/declare';
import { ErrorCodes } from '@/core/bridge/error-codes';

export interface IBaseBridgeResult {
  success?: boolean;
  error?: number;
  errorMessage?: string;

  [key: string]: any;
}

interface IErrorInfo {
  error: number;
  errorMessage: string;
}

class BridgeCallbackWrapper {
  constructor(private readonly _callback: IBridgeCallback) {}

  onSuccess(params: any): void {
    this._callback({
      success: true,
      ...params,
    });
  }

  onError(error?: IErrorInfo | Error | string): void {
    const result: IBaseBridgeResult = { success: false };

    if (typeof error === 'string') {
      result.error = ErrorCodes.UNKNOWN;
      result.errorMessage = error;
    } else if ((error as any) instanceof Error) {
      result.errorMessage = (error as Error).message || `${error}`;
    } else if (typeof error === 'object') {
      const info = error as IErrorInfo;
      result.error = info.error || ErrorCodes.UNKNOWN;
      result.errorMessage = info.errorMessage;
    } else {
      result.error = ErrorCodes.UNKNOWN;
      result.errorMessage = `unknown error: ${error}`;
    }
  }
}

export type IBridgeCallback = (res: IBridgeResult) => void;
export type IBridgeCallbackT<T extends IBridgeResult> = (res: T) => void;

export type IBridgeEventHandler = (
  params: IBaseBridgeParams,
  callback: BridgeCallbackWrapper,
) => void;

export interface IBridgeResult extends IBaseBridgeResult {
  [key: string]: any;

  event?: string;
  params?: IBaseBridgeParams;
  bridgeCallbackId?: string;
}

export type IHandlerRemover = () => void;

export interface IBaseBridgeParams {
  [key: string]: any;
}

export interface IBridgeCallbackInfo {
  callback: IBridgeCallback;
}

export class BaseBridge {
  protected _name: string;

  protected _targetSideName: string;

  private _handlers: MapT<IBridgeEventHandler[]> = {};

  private _callbacks: MapT<IBridgeCallbackInfo> = {};

  constructor(
    name: string,
    targetSideName: string,
    handlers?: MapT<IBridgeEventHandler>,
  ) {
    this._name = name;
    this._targetSideName = targetSideName;

    if (handlers) {
      Object.entries(handlers).forEach(item => {
        this._handlers[item[0]] = [item[1]];
      });
    }
  }

  onMessage(event: string, handler: IBridgeEventHandler): IHandlerRemover {
    if (!handler) {
      return () => {};
    }

    console.log(`[${this._name}] onMessage: ${event}`);

    let list = this._handlers[event];
    if (!list) {
      list = [];
      this._handlers[event] = list;
    }

    list.push(handler);

    return () => {
      this.removeHandler(event, handler);
    };
  }

  onMessages(handlers: MapT<IBridgeEventHandler>): IHandlerRemover {
    if (!handlers) {
      return () => {};
    }

    console.log(`[${this._name}] onMessages: `, Object.keys(handlers));

    Object.entries(handlers).forEach(item => {
      this.onMessage(item[0], item[1]);
    });

    return () => {
      this.removeHandlers(handlers);
    };
  }

  removeHandler(event: string, handler: IBridgeEventHandler) {
    if (!handler) {
      return;
    }

    const handlers = this._handlers[event];
    this._handlers[event] = handlers?.filter(it => it !== handler);
  }

  removeHandlers(handlers: MapT<IBridgeEventHandler>) {
    if (!handlers) {
      return;
    }

    Object.entries(handlers).forEach(item => {
      this.removeHandler(item[0], item[1]);
    });
  }

  clearHandlers(event?: string) {
    if (!event) {
      console.log(
        `[${this._name}] will clear all handlers: size = ${
          Object.keys(this._handlers).length
        }`,
      );

      this._handlers = {};
    } else {
      this._handlers[event] = undefined;
    }
  }

  postMessage(
    event: string,
    params?: IBaseBridgeParams,
    callback?: IBridgeCallback,
  ): IHandlerRemover {
    let bridgeCallbackId;

    if (event !== 'callback' && callback) {
      bridgeCallbackId = `callback-${Date.now()}`;
      this._callbacks[bridgeCallbackId] = { callback };
    }

    this._postMessage(event, params || {}, bridgeCallbackId);

    return () => {
      delete this._callbacks[bridgeCallbackId];
    };
  }

  protected _postMessage(event, params, bridgeCallbackId) {
    throw new Error('_postMessage unimplemented!');
  }

  protected _receiveMessage(message: IBridgeResult) {
    console.log(`[${this._name}] _receiveMessage: `, message);

    const { params, event, bridgeCallbackId } = message;

    if (event === 'callback') {
      // callback scene
      if (bridgeCallbackId) {
        this._handleCallback(bridgeCallbackId, params);
      } else {
        console.warn('no bridgeCallbackId for callback');
      }

      return;
    }

    // invoke scene
    this._handleEvent(event, params, bridgeCallbackId);
  }

  /**
   * post callback result to side bridge
   */
  private _postCallback(bridgeCallbackId, res) {
    if (bridgeCallbackId) {
      console.log(`[${this._name}] will callback: ${bridgeCallbackId}`);

      this._postMessage('callback', res, bridgeCallbackId);
    } else {
      console.log('ignore callback');
    }
  }

  _handleEvent(
    event: string,
    params: IBaseBridgeParams,
    bridgeCallbackId: string,
  ) {
    const handlers = this._handlers[event];

    if (!handlers) {
      console.warn(
        `[${this._name}] cannot find handler: ${event}, ${JSON.stringify(
          params,
        )}`,
      );

      this._postCallback(bridgeCallbackId, {
        success: false,
        error: ErrorCodes.NO_HANDLER,
        errorMessage: `handler not find for ${event}`,
      });

      return;
    }

    const callbackWrapper = new BridgeCallbackWrapper(res => {
      this._postCallback(bridgeCallbackId, res);
    });

    handlers.forEach(handler => handler(params, callbackWrapper));
  }

  private _handleCallback(
    bridgeCallbackId: string,
    params?: IBaseBridgeParams,
  ) {
    if (!bridgeCallbackId) {
      return;
    }

    const { callback } = this._callbacks[bridgeCallbackId] || {};

    if (!callback) {
      console.warn(
        `[${this._name}] cannot find callback with: ${bridgeCallbackId}`,
      );
      return;
    }

    delete this._callbacks[bridgeCallbackId];
    callback(params || {});
  }
}
