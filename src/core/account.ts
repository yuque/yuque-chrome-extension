import { pick } from 'lodash';
import { STORAGE_KEYS } from '@/config';
import Chrome from '@/core/chrome';
import { WordMarkOptionTypeEnum } from '@/isomorphic/constants';
import { PAGE_EVENTS } from '@/events';
import { Book } from './interface';

export interface IUser {
  avatar_url: string;
  id: number;
  login: string;
  login_at: number;
  name: string;
}

export const getCurrentAccount = () =>
  new Promise<IUser>(resolve => {
    Chrome.storage.local.get(STORAGE_KEYS.CURRENT_ACCOUNT, (res = {}) => {
      const account = res[STORAGE_KEYS.CURRENT_ACCOUNT];
      if (!account?.login_at) {
        resolve({} as IUser);
        return;
      }
      resolve(account || {});
    });
  });

export const setCurrentAccount = account =>
  new Promise(resolve => {
    const value = pick(account, [ 'id', 'login', 'name', 'avatar_url' ]);
    const newValue = {
      ...value,
      login_at: Date.now(),
    };
    Chrome.storage.local.set(
      {
        [STORAGE_KEYS.CURRENT_ACCOUNT]: newValue,
      },
      () => {
        resolve(undefined);
      },
    );
  });

export const clearCurrentAccount = () =>
  new Promise(resolve => {
    Chrome.storage.local.remove(STORAGE_KEYS.CURRENT_ACCOUNT, () => {
      resolve(undefined);
    });
  });

export enum WordMarkConfigKey {
  // 是否开启
  enable = 'enable',

  // 剪藏默认存储地址
  defaultSavePosition = 'defaultSavePosition',

  // 划词置顶的操作
  innerPinList = 'innerPinList',

  // 禁用页面的 url
  disableUrl = 'disableUrl',
}

export interface IWordMarkConfig {
  [WordMarkConfigKey.enable]: boolean;
  [WordMarkConfigKey.defaultSavePosition]: Book;
  [WordMarkConfigKey.innerPinList]: Array<WordMarkOptionTypeEnum>;
  [WordMarkConfigKey.disableUrl]: Array<string>;
}

export const defaultWordMarkConfig: IWordMarkConfig = {
  [WordMarkConfigKey.enable]: false,
  [WordMarkConfigKey.defaultSavePosition]: {
    type: 'Note',
    id: 0,
    name: '小记',
  },
  [WordMarkConfigKey.innerPinList]: [
    WordMarkOptionTypeEnum.translate,
    WordMarkOptionTypeEnum.clipping,
  ],
  [WordMarkConfigKey.disableUrl]: [],
};


export const updateWordMarkConfig = (key: WordMarkConfigKey, value: any) =>
  new Promise(resolve => {
    Chrome.storage.local.get(STORAGE_KEYS.SETTINGS.WORD_MARK_CONFIG, config => {
      const result = {
        ...(config?.[STORAGE_KEYS.SETTINGS.WORD_MARK_CONFIG] ||
          defaultWordMarkConfig),
        [key]: value,
      };
      // enable 改变时，将 disable url 全部清空
      if (key === WordMarkConfigKey.enable) {
        result[WordMarkConfigKey.disableUrl] = [];
      }
      Chrome.storage.local.set(
        {
          [STORAGE_KEYS.SETTINGS.WORD_MARK_CONFIG]: result,
        },
        () => {
          resolve(result);
        },
      );
      // 通知所有页面 wordMark 的设置发生了变化
      Chrome.tabs.query({}, tabs => {
        for (const tab of tabs) {
          Chrome.tabs.sendMessage(tab.id, {
            action: PAGE_EVENTS.ENABLE_WORD_MARK_STATUE_CHANGE,
            data: result,
          });
        }
      });
    });
  });

export const getWordMarkConfig = () =>
  new Promise<IWordMarkConfig>(resolve => {
    Chrome.storage.local.get(STORAGE_KEYS.SETTINGS.WORD_MARK_CONFIG, config => {
      resolve(
        config[STORAGE_KEYS.SETTINGS.WORD_MARK_CONFIG] || defaultWordMarkConfig,
      );
    });
  });
