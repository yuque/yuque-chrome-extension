import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { IUser } from '@/isomorphic/interface';
import { pageEvent } from '@/core/event/pageEvent';
import { PageEventTypes } from '@/isomorphic/event/pageEvent';
import { storage } from '@/isomorphic/storage';
import { useEffectAsync } from '@/hooks/useAsyncEffect';
import { STORAGE_KEYS } from '@/config';
import Login from './Login';
import { AccountContext } from './context';

interface IAccountLayoutProps {
  children: React.ReactNode;
  close?: () => void;
}

function AccountLayout(props: IAccountLayoutProps) {
  const [user, setUser] = useState<IUser | null>(null);
  const [ready, setAppReady] = useState(false);
  const [forceUpgradeHtml, setForceUpgradeHtml] = useState<string>();

  const onLogout = useCallback(async () => {
    await storage.remove(STORAGE_KEYS.CURRENT_ACCOUNT);
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
    const info = (await storage.get(STORAGE_KEYS.CURRENT_ACCOUNT)) as IUser;
    if (!info?.login_at) {
      setUser(null);
      setAppReady(true);
      return;
    }
    try {
      setUser(info);
    } catch (error) {
      console.log('init user error:', error);
    }
    setAppReady(true);
  }, []);

  useEffect(() => {
    const removerLoginOutListener = pageEvent.addListener(PageEventTypes.LogOut, onLogout);
    const removerForceUpdateListener = pageEvent.addListener(PageEventTypes.ForceUpgradeVersion, res => {
      setForceUpgradeHtml(res.html);
    });
    return () => {
      removerLoginOutListener();
      removerForceUpdateListener();
    };
  }, []);

  if (!ready) {
    return null;
  }

  const isLogined = !!user?.id;

  return (
    <AccountContext.Provider value={providerValue as any}>
      {isLogined && !forceUpgradeHtml ? (
        props.children
      ) : (
        <Login onLoginSuccess={setUser} forceUpgradeHtml={forceUpgradeHtml} />
      )}
    </AccountContext.Provider>
  );
}

export default AccountLayout;
