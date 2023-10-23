import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Modal } from 'antd';
import { IUser } from '@/isomorphic/interface';
import { __i18n } from '@/isomorphic/i18n';
import {
  AccountLayoutMessageActions,
  AccountLayoutMessageKey,
} from '@/isomorphic/event/accountLayout';
import { useEffectAsync } from '@/hooks/useAsyncEffect';
import { backgroundBridge } from '@/core/bridge/background';
import Chrome from '@/core/chrome';
import { findCookieSettingPage } from '@/core/uitl';
import {
  EXTENSION_ID,
  REFERER_URL,
  REQUEST_HEADER_VERSION,
  STORAGE_KEYS,
  TRACERT_CONFIG,
  VERSION,
} from '@/config';
import Login from './Login';
import { AccountContext } from './context';

declare const Tracert: any;

interface IAccountLayoutProps {
  children: React.ReactNode;
  close?: () => void;
}

function AccountLayout(props: IAccountLayoutProps) {
  const [user, setUser] = useState<IUser | null>(null);
  const [ready, setAppReady] = useState(false);
  const [forceUpgradeHtml, setForceUpgradeHtml] = useState<string>();

  const onLogout = useCallback(async () => {
    await backgroundBridge.storage.remove(STORAGE_KEYS.CURRENT_ACCOUNT);
    setUser(null);
  }, []);

  const providerValue = useMemo(
    () => ({
      user,
      onLogout,
    }),
    [user, onLogout],
  );

  useEffectAsync(async () => {
    const info = (await backgroundBridge.storage.get(
      STORAGE_KEYS.CURRENT_ACCOUNT,
    )) as IUser;
    if (!info?.login_at) {
      setUser(null);
      setAppReady(true);
      return;
    }
    try {
      if (!navigator.cookieEnabled) {
        await new Promise(resolve => {
          const pageUrl = findCookieSettingPage();
          Modal.info({
            content: __i18n(
              '请前往「隐私和安全」打开「允许第三方cookies」，避免登录失败',
            ),
            title: __i18n('使用提示'),
            closable: true,
            icon: null,
            okText: pageUrl ? __i18n('打开隐私和安全') : __i18n('确定'),
            autoFocusButton: null,
            onOk: () => {
              if (pageUrl) {
                backgroundBridge.tab.create(pageUrl);
              }
              resolve(true);
            },
            afterClose: () => {
              resolve(true);
            },
          });
        });
      }
      const accountInfo: any =
        await backgroundBridge.request.mine.getUserInfo();
      if (accountInfo && accountInfo?.id === info.id) {
        const tabInfo = await backgroundBridge.tab.getCurrent();
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
        setUser(info);
      }
    } catch (error) {
      console.log('init user error:', error);
    }
    setAppReady(true);
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent<any>) => {
      const { data, key, action } = e.data || {};
      if (key !== AccountLayoutMessageKey) {
        return;
      }
      switch (action) {
        case AccountLayoutMessageActions.ForceUpdate: {
          setForceUpgradeHtml(data.html);
          break;
        }
        case AccountLayoutMessageActions.LoginOut: {
          onLogout();
          break;
        }
        default:
          break;
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, []);

  if (!ready) {
    return null;
  }

  const isLogined = !!user?.id;

  return (
    <AccountContext.Provider value={providerValue as any}>
      {isLogined ? (
        props.children
      ) : (
        <Login onLoginSuccess={setUser} forceUpgradeHtml={forceUpgradeHtml} />
      )}
    </AccountContext.Provider>
  );
}

export default AccountLayout;
