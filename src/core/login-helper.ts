import Chrome from '@/core/chrome';
import { SERVER_URLS } from '@/isomorphic/constants';
import { mineProxy } from './proxy/mine';
import { setCurrentAccount } from './account';

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
      ({ id: windowId }) => resolve(windowId),
    );
  });
};

const waitForWindowLogined = (windowId: number) => {
  return new Promise<void>(resolve => {
    Chrome.webRequest.onCompleted.addListener(
      data => {
        if (data.url === SERVER_URLS.DASHBOARD) {
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

export const login = async () => {
  const windowId = await createLoginWindow();
  await waitForWindowLogined(windowId);
  await removeWindow(windowId);
  const accountInfo = await mineProxy.getUserInfo();
  await setCurrentAccount(accountInfo);
  return accountInfo;
}

