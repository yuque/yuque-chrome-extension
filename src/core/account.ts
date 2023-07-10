import { pick } from 'lodash';
import moment from 'moment';
import { STORAGE_KEYS } from '@/config';
import Chrome from '@/core/chrome';

const MAX_EXPIERED_DAYS = 3;

export const getCurrentAccount = () =>
  new Promise(resolve => {
    Chrome.storage.local.get(STORAGE_KEYS.CURRENT_ACCOUNT, (res = {}) => {
      const account = res[STORAGE_KEYS.CURRENT_ACCOUNT];
      if (!account?.login_at) {
        resolve({});
        return;
      }
      const day1 = moment(account.login_at);
      const diff = moment().diff(day1, 'days');
      if (diff >= MAX_EXPIERED_DAYS) {
        clearCurrentAccount().then(() => {
          resolve({});
        });
        return;
      }
      resolve(account || {});
    });
  });

export const setCurrentAccount = (account) =>
  new Promise(resolve => {
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
  });;

export const clearCurrentAccount = () =>
  new Promise(resolve => {
    Chrome.storage.local.remove(STORAGE_KEYS.CURRENT_ACCOUNT, () => {
      resolve(undefined);
    });
  });
