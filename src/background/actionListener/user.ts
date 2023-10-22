import { pick } from 'lodash';
import Chrome from '@/background/core/chrome';
import { IOperateUserData, OperateUserEnum } from '@/isomorphic/background/user';
import { SERVER_URLS } from '@/isomorphic/constants';
import { mineProxy } from '@/core/proxy/mine';
import Storage from '@/background/core/storage';
import { STORAGE_KEYS } from '@/config';
import { RequestMessage } from './index';

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
        url: SERVER_URLS.LOGOUT,
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
      const windowId = await createLoginWindow();
      await waitForWindowLogined(windowId);
      await removeWindow(windowId);
      const accountInfo = await mineProxy.getUserInfo();
      const value = pick(accountInfo, ['id', 'login', 'name', 'avatar_url']);
      const newValue = {
        ...value,
        login_at: Date.now(),
      };
      await Storage.update(STORAGE_KEYS.CURRENT_ACCOUNT, newValue);
      callback(newValue);
      break;
    }
    case OperateUserEnum.logout: {
      break;
    }
    default: {
      callback(true);
      break;
    }
  }
}
