import { BackgroundEvents } from '@/isomorphic/background';
import {
  OperateConfigManagerEnum,
  IConfigManagerOption,
  ManagerType,
  ManagerKey,
} from '@/isomorphic/background/configManager';
import type { ICallBridgeImpl } from './index';

export function createConfigManagerBridge(impl: ICallBridgeImpl) {
  return {
    configManager: {
      async update(
        managerType: ManagerType,
        key: ManagerKey,
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

      async get(managerType: ManagerType): Promise<any> {
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
