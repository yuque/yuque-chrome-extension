import { pick } from 'lodash';
import { STORAGE_KEYS } from '@/config';
import Chrome from '@/core/chrome';
import { WordMarkOptionTypeEnum } from '@/isomorphic/constants';

export const getCurrentAccount = () => new Promise(resolve => {
  Chrome.storage.local.get(STORAGE_KEYS.CURRENT_ACCOUNT, (res = {}) => {
    const account = res[STORAGE_KEYS.CURRENT_ACCOUNT];
    if (!account?.login_at) {
      resolve({});
      return;
    }
    resolve(account || {});
  });
});

export const setCurrentAccount = account => new Promise(resolve => {
  const value = pick(account, [
    'id',
    'login',
    'name',
    'avatar_url',
  ]);
  const newValue = {
    ...value,
    login_at: Date.now(),
  };
  Chrome.storage.local.set({
    [STORAGE_KEYS.CURRENT_ACCOUNT]: newValue,
  }, () => {
    resolve(undefined);
  });
});

export const clearCurrentAccount = () => new Promise(resolve => {
  Chrome.storage.local.remove(STORAGE_KEYS.CURRENT_ACCOUNT, () => {
    resolve(undefined);
  });
});

export const updateWordMarkPinList = (list: WordMarkOptionTypeEnum[]) => new Promise(resolve => {
  Chrome.storage.local.set({
    [STORAGE_KEYS.SETTINGS.WORD_MARK_PIN]: list
  }, () => {
    resolve(list);
  });
});

export const getWordMarkPinList = () => new Promise(resolve => {
  Chrome.storage.local.get(STORAGE_KEYS.SETTINGS.WORD_MARK_PIN, (list) => {
    resolve(list[STORAGE_KEYS.SETTINGS.WORD_MARK_PIN]);
  });
});

