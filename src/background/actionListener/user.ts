import { pick } from 'lodash';
import Chrome from '@/background/core/chrome';
import {
  IOperateUserData,
  OperateUserEnum,
} from '@/isomorphic/background/user';
import { IUser } from '@/isomorphic/interface';
import Storage from '@/background/core/storage';
import requestFn from '@/background/core/request';
import { STORAGE_KEYS, YUQUE_DOMAIN } from '@/config';
import { RequestMessage } from './index';

export const SERVER_URLS = {
  LOGIN_PAGE: `${YUQUE_DOMAIN}/login`,
  LOGIN: `${YUQUE_DOMAIN}/api/accounts/login`,
  DASHBOARD: `${YUQUE_DOMAIN}/dashboard`,
};

const createLoginWindow = (): Promise<number> => {
  return new Promise(resolve => {
    Chrome.windows.create(
      {
        focused: true,
        width: 500,
        height: 680,
        left: 400,
        top: 100,
        type: 'panel',
        url: SERVER_URLS.LOGIN_PAGE,
      },
      res => resolve(res?.id as number),
    );
  });
};

const waitForWindowLogined = (windowId: number) => {
  return new Promise<void>(resolve => {
    Chrome.webRequest.onCompleted.addListener(
      data => {
        if ([SERVER_URLS.DASHBOARD, SERVER_URLS.LOGIN].includes(data.url)) {
          if (data.statusCode === 200) {
            resolve();
          }
        }
      },
      {
        urls: [],
        windowId,
      },
    );
  });
};

const removeWindow = (windowId: number) => {
  return new Promise(resolve => {
    Chrome.windows.remove(windowId, resolve);
  });
};

export async function createUserActionListener(
  request: RequestMessage<IOperateUserData>,
  callback: (params: any) => void,
) {
  const { type } = request.data;
  switch (type) {
    case OperateUserEnum.login: {
      try {
        await requestFn('/api/accounts/logout', {
          method: 'DELETE',
        });
        const windowId = await createLoginWindow();
        await waitForWindowLogined(windowId);
        await removeWindow(windowId);
        const { data, status } = await requestFn('/api/mine', {
          method: 'GET',
        });
        if (status === 200) {
          const accountInfo = (data as any).data as IUser;
          const value = pick(accountInfo, [
            'id',
            'login',
            'name',
            'avatar_url',
          ]);
          const newValue = {
            ...value,
            login_at: Date.now(),
          };
          await Storage.update(STORAGE_KEYS.CURRENT_ACCOUNT, newValue);
          callback(newValue);
        }
        callback(null);
      } catch (error) {
        callback(error);
      }
      break;
    }
    case OperateUserEnum.getUserShortCut: {
      const result = await Chrome.commands.getAll();
      callback(result);
      break;
    }
    default: {
      break;
    }
  }
}
