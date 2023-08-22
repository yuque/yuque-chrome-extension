import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import classnames from 'classnames';
import { AccountContext } from '@/context/account-context';
import {
  IUser,
  clearCurrentAccount,
  getCurrentAccount,
  setCurrentAccount,
} from '@/core/account';
import Chrome from '@/core/chrome';
import proxy, { SERVER_URLS } from '@/core/proxy';
import {
  REQUEST_HEADER_VERSION,
  EXTENSION_ID,
  VERSION,
  TRACERT_CONFIG,
  REFERER_URL,
} from '@/config';
import eventManager from '@/core/event/eventManager';
import { AppEvents } from '@/core/event/events';
import Login from './login';
import styles from './index.module.less';

declare const Tracert: any;

interface IAccountLayoutProps {
  children: React.ReactNode;
  position?: 'rightTop' | 'center';
}

function AccountLayout(props: IAccountLayoutProps) {
  const { position = 'rightTop' } = props;
  const [ user, setUser ] = useState(null);
  const [ ready, setAppReady ] = useState(false);
  const [ forceUpgradeInfo, setForceUpgradeInfo ] = useState<string>();

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

  const onLogin = async () => {
    const windowId = await createLoginWindow();
    await waitForWindowLogined(windowId);
    await removeWindow(windowId);
    const accountInfo = await proxy.getMineInfo();
    if (!accountInfo) {
      message.error(__i18n('登录失败'));
      return;
    }
    await setCurrentAccount(accountInfo);
    setUser(accountInfo);
  };

  const renderUnLogin = () => {
    if (forceUpgradeInfo) {
      return <div dangerouslySetInnerHTML={{ __html: forceUpgradeInfo }} />;
    }
    return (
      <div className={classnames(styles[position], styles.loginWrapper)}>
        <Login onConfirm={onLogin} />
      </div>
    );
  };

  const onLogout = (data = {}) => {
    clearCurrentAccount().then(() => {
      setUser(undefined);
      // @ts-ignore
      if (data.html) {
        // @ts-ignore
        setForceUpgradeInfo(data.html);
      }
    });
  };

  useEffect(() => {
    getCurrentAccount()
      .then(async info => {
        setUser(info);
        const tabInfo = await Chrome.getCurrentTab();
        // 上报埋点
        Tracert.start({
          spmAPos: TRACERT_CONFIG.spmAPos,
          spmBPos: TRACERT_CONFIG.spmBPos,
          role_id: (info as IUser)?.id,
          mdata: {
            [REQUEST_HEADER_VERSION]: VERSION,
            [EXTENSION_ID]: Chrome.runtime.id,
            [REFERER_URL]: tabInfo?.url,
          },
        });
      })
      .finally(() => {
        setAppReady(true);
      });
  }, []);

  useEffect(() => {
    eventManager.listen(AppEvents.FORCE_UPGRADE_VERSION, data => {
      onLogout(data);
    });
  }, []);

  if (!ready) {
    return null;
  }

  const isLogined = !!user?.id;

  return (
    <AccountContext.Provider value={{ user, onLogout }}>
      {isLogined ? props.children : renderUnLogin()}
    </AccountContext.Provider>
  );
}

export default AccountLayout;
