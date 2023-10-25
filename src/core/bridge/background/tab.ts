import { BackgroundEvents } from '@/isomorphic/background';
import { OperateTabEnum } from '@/isomorphic/background/tab';
import { ICallBridgeImpl } from './index';

export function createTabBridge(impl: ICallBridgeImpl) {
  return {
    tab: {
      async screenShot() {
        return new Promise(resolve => {
          impl(
            BackgroundEvents.OperateTab,
            { type: OperateTabEnum.screenShot },
            res => {
              resolve(res);
            },
          );
        });
      },
      async getCurrent(): Promise<chrome.tabs.Tab | undefined> {
        return new Promise(resolve => {
          impl(
            BackgroundEvents.OperateTab,
            { type: OperateTabEnum.getCurrent },
            res => {
              resolve(res);
            },
          );
        });
      },
      async create(url: string) {
        return new Promise(resolve => {
          impl(
            BackgroundEvents.OperateTab,
            { type: OperateTabEnum.create, url },
            res => {
              resolve(res);
            },
          );
        });
      },
    },
  };
}
