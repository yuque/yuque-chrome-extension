import Chrome from '@/core/chrome';
import { MapT, OneArgFunctionT } from '@/common/declare';
import { createStorageBridge } from './stroge';
import { createUserBridge } from './user';
import { createClipBridge } from './clip';
import { createTabBridge } from './tab';
import { createSidePanelBridge } from './sidePanel';
import { createRequestBridge } from './request';
import { createWordMarkConfigBridge } from './wordMarkConfig';

export interface IBridgeParams {
  [key: string]: any;
}

export interface IBridgeError {
  errorMessage?: string;

  [key: string]: any;
}

type IBridgeCallback = (res: any) => void;

export type ICallBridgeImpl = (
  bridgeName: string,
  params?: IBridgeParams,
  callback?: IBridgeCallback,
) => void;

export function callBackgroundBridge(
  bridgeName: string,
  data?: MapT<any>,
  callback?: OneArgFunctionT<any>,
) {
  callback = callback || function () {
    // ignore
  };
  Chrome.runtime.sendMessage(
    {
      action: bridgeName,
      data: data,
    },
    res => {
      callback?.(res);
    },
  );
}

export function createBridges(impl: ICallBridgeImpl) {
  return {
    ...createStorageBridge(impl),
    ...createUserBridge(impl),
    ...createClipBridge(impl),
    ...createTabBridge(impl),
    ...createSidePanelBridge(impl),
    ...createRequestBridge(impl),
    ...createWordMarkConfigBridge(impl),
  };
}

export const backgroundBridge = createBridges(callBackgroundBridge);
