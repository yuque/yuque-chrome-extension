import React, { useState, useEffect, useContext, useCallback } from 'react';
import classnames from 'classnames';
import Icon from '@ant-design/icons';
import { AccountContext } from '@/context/account-context';
import { IUser } from '@/core/account';
import Chrome from '@/core/chrome';
import {
  REQUEST_HEADER_VERSION,
  EXTENSION_ID,
  VERSION,
  TRACERT_CONFIG,
  REFERER_URL,
} from '@/config';
import CloseSvg from '@/assets/svg/close.svg';
import useAsyncEffect from '@/hooks/useAsyncEffect';
import { sendMessageToBack } from '@/core/bridge/inject-to-background';
import { BACKGROUND_EVENTS } from '@/events';
import eventManager from '@/core/event/eventManager';
import { AppEvents } from '@/core/event/events';
import { InjectAppContext } from '@/context/inject-app-context';
import { InjectAppType } from '@/isomorphic/constants';
import Login from './login';
import styles from './index.module.less';

declare const Tracert: any;

interface IAccountLayoutProps {
  children: React.ReactNode;
  position?: 'rightTop' | 'center';
  close?: () => void;
}

function AccountLayout(props: IAccountLayoutProps) {
  const { injectAppType } = useContext(InjectAppContext);
  const { position = 'rightTop', close } = props;
  const [ user, setUser ] = useState(null);
  const [ ready, setAppReady ] = useState(false);
  const [ forceUpgradeInfo, setForceUpgradeInfo ] = useState<string>();

  const onLogin = useCallback(() => {
    sendMessageToBack(BACKGROUND_EVENTS.REQUEST_LOGIN);
  }, []);

  const renderUnLogin = () => {
    if (injectAppType !== InjectAppType.clipping) {
      return null;
    }
    return (
      <div className={classnames(styles[position], styles.loginWrapper)}>
        {forceUpgradeInfo ? (
          <div dangerouslySetInnerHTML={{ __html: forceUpgradeInfo }} />
        ) : (
          <Login onConfirm={onLogin} />
        )}
        {close && (
          <div onClick={close} className={styles.closeWrapper}>
            <Icon component={CloseSvg} />
          </div>
        )}
      </div>
    );
  };

  const onLogout = async (data = {}) => {
    await sendMessageToBack(BACKGROUND_EVENTS.REQUEST_LOGOUT);
    setUser(undefined);
    if ((data as any).html) {
      setForceUpgradeInfo((data as any)?.html);
    }
  };

  useAsyncEffect(async () => {
    try {
      const info = await sendMessageToBack(
        BACKGROUND_EVENTS.GET_CURRENT_ACCOUNT_INFO,
      );
      setUser(info);
      Tracert.start({
        spmAPos: TRACERT_CONFIG.spmAPos,
        spmBPos: TRACERT_CONFIG.spmBPos,
        role_id: (info as IUser)?.id,
        mdata: {
          [REQUEST_HEADER_VERSION]: VERSION,
          [EXTENSION_ID]: Chrome.runtime.id,
          [REFERER_URL]: window.location.href,
        },
      });
    } catch (e) {
      //
    }
    setAppReady(true);
  }, []);

  useEffect(() => {
    const loginSuccess = async () => {
      const info = await sendMessageToBack(
        BACKGROUND_EVENTS.GET_CURRENT_ACCOUNT_INFO,
      );
      setUser(info);
    };
    eventManager.listen(AppEvents.LOGIN_SUCCESS, loginSuccess);
    return () => {
      eventManager.removeListener(AppEvents.LOGIN_SUCCESS, loginSuccess);
    };
  }, []);

  if (!ready) {
    return null;
  }

  const isLogined = !!user?.id;

  return (
    <AccountContext.Provider
      value={{
        user,
        onLogout,
      }}
    >
      {isLogined ? props.children : renderUnLogin()}
    </AccountContext.Provider>
  );
}

export default AccountLayout;
