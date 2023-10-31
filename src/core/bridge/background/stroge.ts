import { BackgroundEvents } from '@/isomorphic/background';
import { OperateStorageEnum } from '@/isomorphic/background/storage';
import { ICallBridgeImpl } from './index';

export function createStorageBridge(impl: ICallBridgeImpl) {
  return {
    storage: {
      async get(key: string): Promise<any> {
        return new Promise(resolve => {
          impl(
            BackgroundEvents.OperateStorage,
            { key, type: OperateStorageEnum.get },
            res => {
              resolve(res);
            },
          );
        });
      },

      async update(key: string, data: any) {
        return new Promise(resolve => {
          impl(
            BackgroundEvents.OperateStorage,
            { key, type: OperateStorageEnum.update, data },
            (res: any) => {
              resolve(res);
            },
          );
        });
      },

      async remove(key: string) {
        return new Promise(resolve => {
          impl(
            BackgroundEvents.OperateStorage,
            { key, type: OperateStorageEnum.remove },
            () => {
              resolve(true);
            },
          );
        });
      },
    },
  };
}
