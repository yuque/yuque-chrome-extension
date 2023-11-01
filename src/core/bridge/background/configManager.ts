import { BackgroundEvents } from '@/isomorphic/background';
import {
  OperateConfigManagerEnum,
  IConfigManagerOption,
  ManagerKey,
} from '@/isomorphic/background/configManager';
import type { ICallBridgeImpl } from './index';

export function createConfigManagerBridge(impl: ICallBridgeImpl) {
  return {
    configManager: {
      async update<T extends keyof ManagerKey>(
        managerType: T,
        key: ManagerKey[T],
        value: any,
        option?: IConfigManagerOption,
      ): Promise<boolean> {
        return new Promise(resolve => {
          impl(
            BackgroundEvents.OperateManagerConfig,
            {
              type: OperateConfigManagerEnum.update,
              key,
              value,
              option,
              managerType,
            },
            () => {
              resolve(true);
            },
          );
        });
      },

      async get<T extends keyof ManagerKey>(managerType: T): Promise<any> {
        return new Promise(resolve => {
          impl(
            BackgroundEvents.OperateManagerConfig,
            { type: OperateConfigManagerEnum.get, managerType },
            res => {
              resolve(res);
            },
          );
        });
      },
    },
  };
}
