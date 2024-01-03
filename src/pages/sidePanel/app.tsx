import React, { useEffect, useRef, useState } from 'react';
import AccountLayout from '@/components/AccountLayout';
import SuperSideBarContainer from '@/components/SuperSideBar/container';
import AntdLayout from '@/components/AntdLayout';
import {
  SidePanelMessageActions,
  SidePanelMessageKey,
} from '@/isomorphic/event/sidePanel';
import { storage } from '@/isomorphic/storage';
import { backgroundBridge } from '@/core/bridge/background';
import {
  EXTENSION_ID,
  REFERER_URL,
  REQUEST_HEADER_VERSION,
  STORAGE_KEYS,
  TRACERT_CONFIG,
  VERSION,
} from '@/config';
import { IUser } from '@/isomorphic/interface';
import Env from '@/isomorphic/env';
import { useForceUpdate } from '@/hooks/useForceUpdate';
import { webProxy } from '@/core/webProxy';
import styles from './app.module.less';
import '@/styles/global.less';

declare const Tracert: any;

const MiniWidth = 416;

function App() {
  const [sidePanelIsReady, setSidePanelIsReady] = useState(false);
  const { forceUpdate } = useForceUpdate();
  const disableRef = useRef(window.innerWidth < MiniWidth);

  useEffect(() => {
    if (Env.isRunningHostPage) {
      return;
    }
    const onResize = () => {
      const disable = window.innerWidth < MiniWidth;
      if (disable !== disableRef.current) {
        disableRef.current = disable;
        forceUpdate();
      }
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    if (sidePanelIsReady) {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('tracert_a385.js');
      document.body.appendChild(script);
      script.onload = () => {
        backgroundBridge.tab.getCurrent().then(async tabInfo => {
          const info = await storage.get(
            STORAGE_KEYS.CURRENT_ACCOUNT,
          );
          const user = await webProxy.mine.getUserInfo();
          if (user?.id !== info?.id) {
            await storage.remove(STORAGE_KEYS.CURRENT_ACCOUNT);
          }
          Tracert.start({
            spmAPos: TRACERT_CONFIG.spmAPos,
            spmBPos: TRACERT_CONFIG.spmBPos,
            role_id: (info as IUser)?.id,
            mdata: {
              [REQUEST_HEADER_VERSION]: VERSION,
              [EXTENSION_ID]: chrome.runtime.id,
              [REFERER_URL]: tabInfo?.url,
            },
          });
        });
      };
      return;
    }
    const listener = async (e: MessageEvent<any>) => {
      const { key, action } = e.data || {};
      if (key !== SidePanelMessageKey) {
        return;
      }
      switch (action) {
        case SidePanelMessageActions.arouse: {
          setSidePanelIsReady(true);
          break;
        }
        default:
          break;
      }
    };
    if (!Env.isRunningHostPage) {
      setSidePanelIsReady(true);
      return;
    }
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [sidePanelIsReady]);

  return (
    <AntdLayout>
      <div className={styles.appWrapper}>
        <div className={styles.sidePanelWrapper}>
          <AccountLayout>
            {sidePanelIsReady && <SuperSideBarContainer />}
          </AccountLayout>
        </div>
        {disableRef.current && !Env.isRunningHostPage && (
          <div className={styles.disableWrapper}>
            <div className={styles.disableModal}>
              <img src="https://mdn.alipayobjects.com/huamei_0prmtq/afts/img/A*MQcdSY9buAgAAAAAAAAAAAAADvuFAQ/original" />
            </div>
          </div>
        )}
      </div>
    </AntdLayout>
  );
}

export default App;
