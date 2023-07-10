import { VoidFunction } from '@/common/declare';
import { BaseBridge, IBaseBridgeParams, IBridgeResult } from './base-bridge';

const EXTENSION_BRIDGE_EVENT_NAME = 'YuqueExtensionBridge';

/**
 * Bridge implementation based on window dispatchEvent.
 * for browser <-> content_script communicate.
 */
export default class ExtensionBridge extends BaseBridge {
  private eventRemover?: VoidFunction;

  private readonly eventListener = (e: CustomEvent) => {
    this._receiveMessage(e.detail);
  };

  private get bridgeEventName(): string {
    return `${EXTENSION_BRIDGE_EVENT_NAME}_${this._name}`;
  }

  private get targetSideBridgeEventName(): string {
    return `${EXTENSION_BRIDGE_EVENT_NAME}_${this._targetSideName}`;
  }

  connect(): VoidFunction {
    if (!this.eventRemover) {
      console.log(`[${this._name}] extension bridge connected: ${Date.now()}`);

      const eventName = this.bridgeEventName;
      window.addEventListener(eventName, this.eventListener);
      this.eventRemover = () => {
        window.removeEventListener(eventName, this.eventListener);
      };
    }

    return () => {
      this.disconnect();
    };
  }

  disconnect(keepHandlers?: boolean) {
    console.log(`[${this._name}] extension bridge disconnected: ${Date.now()}`);

    if (!keepHandlers) {
      this.clearHandlers();
    }

    this.eventRemover?.();
    this.eventRemover = undefined;
  }

  protected _postMessage(
    event: string,
    params: IBaseBridgeParams,
    bridgeCallbackId?: string,
  ) {
    const eventDetail: IBridgeResult = {
      event,
      params,
      bridgeCallbackId,
    };

    const bridgeEvent = new CustomEvent(this.targetSideBridgeEventName, {
      detail: eventDetail,
    });

    window.dispatchEvent(bridgeEvent);
  }
}
