import { BackgroundEvents } from '@/isomorphic/background';
import {
  OperateWordConfigMarkEnum,
  IWordMarkConfigOption,
} from '@/isomorphic/background/wordMarkConfig';
import { IWordMarkConfig, WordMarkConfigKey } from '@/isomorphic/word-mark';
import type { ICallBridgeImpl } from './index';

export function createWordMarkConfigBridge(impl: ICallBridgeImpl) {
  return {
    wordMarkConfig: {
      async update(
        key: WordMarkConfigKey,
        value: any,
        option?: IWordMarkConfigOption,
      ): Promise<boolean> {
        return new Promise(resolve => {
          impl(
            BackgroundEvents.OperateWordMarkConfig,
            { type: OperateWordConfigMarkEnum.update, key, value, option },
            () => {
              resolve(true);
            },
          );
        });
      },

      async get(): Promise<IWordMarkConfig> {
        return new Promise(resolve => {
          impl(
            BackgroundEvents.OperateWordMarkConfig,
            { type: OperateWordConfigMarkEnum.get },
            (res: IWordMarkConfig) => {
              resolve(res);
            },
          );
        });
      },
    },
  };
}
