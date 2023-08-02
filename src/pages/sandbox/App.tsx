import React, { useState, useEffect } from 'react';
import { ConfigProvider, Radio, RadioChangeEvent, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import classnames from 'classnames';

import Chrome from '@/core/chrome';
import formatHTML from '@/components/editor/format-html';
import formatMD from '@/components/editor/format-md';
import deserialize from '@/components/editor/deserialize';
import { GLOBAL_EVENTS } from '@/events';
import { initI18N } from '@/isomorphic/i18n';
import proxy, { SERVER_URLS } from '@/core/proxy';
import {
  getCurrentAccount,
  setCurrentAccount,
  clearCurrentAccount,
} from '@/core/account';

import UserInfo, { IYuqueAccount } from './UserInfo';
import FeedBack from './FeedBack';
import Login from './Login';
import styles from './App.module.less';
import { EditorValueContext } from './EditorValueContext';
import { Other } from './Other';
import SaveTo from './SaveTo';

type MessageSender = chrome.runtime.MessageSender;

type SendResponse = (response: any) => void;

interface RequestMessage {
  action: keyof typeof GLOBAL_EVENTS;
  htmls?: string[];
}

initI18N();

const useViewModel = () => {
  const [ appReady, setAppReady ] = useState<boolean>(false);
  const [ account, setAccount ] = useState<IYuqueAccount>();
  const [ forceUpgradeInfo, setForceUpgradeInfo ] = useState<string>();

  const onClose = () => {
    Chrome.tabs.getCurrent((tab: any) => {
      Chrome.tabs.sendMessage(tab.id, {
        action: GLOBAL_EVENTS.CLOSE_BOARD,
      });
    });
  };

  const onLogout = (data = {}) => {
    clearCurrentAccount().then(() => {
      setAccount(undefined);
      // @ts-ignore
      if (data.html) {
        // @ts-ignore
        setForceUpgradeInfo(data.html);
      }
    });
  };

  function createLoginWindow() {
    return new Promise(resolve => {
      Chrome.windows.create(
        {
          focused: true,
          width: 480,
          height: 640,
          left: 400,
          top: 100,
          type: 'panel',
          url: SERVER_URLS.LOGOUT,
        },
        ({ id: windowId }) => resolve(windowId),
      );
    });
  }

  function waitForWindowLogined(windowId) {
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
  }

  function removeWindow(windowId) {
    return new Promise(resolve => {
      Chrome.windows.remove(windowId, resolve);
    });
  }

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
    setAccount(accountInfo);
  };

  useEffect(() => {
    getCurrentAccount().then(info => {
      setAccount(info as IYuqueAccount);
    }).finally(() => {
      setAppReady(true);
    });
  }, []);

  return {
    state: {
      appReady,
      account,
      forceUpgradeInfo,
    },
    onClose,
    onLogout,
    onLogin,
  };
};

type TabName = 'save-to' | 'other';

const App = () => {
  const [ editorValue, setEditorValue ] = useState([]);
  const [ currentType, setCurrentType ] = useState(null);
  const {
    state: { account, forceUpgradeInfo, appReady },
    onClose,
    onLogout,
    onLogin,
  } = useViewModel();

  const onReceiveMessage = async (
    request: RequestMessage,
    _sender: MessageSender,
    sendResponse: SendResponse,
  ) => {
    switch (request.action) {
      case GLOBAL_EVENTS.GET_SELECTED_TEXT: {
        const { htmls } = request;
        const newHtml = htmls.map(html => formatHTML(html)).join('');
        const document = new window.DOMParser().parseFromString(
          newHtml,
          'text/html',
        );
        const value = deserialize(document.body);
        setEditorValue([ ...editorValue, ...formatMD(value) ]);
        setCurrentType('selection');
        sendResponse(true);
        return;
      }
      default:
        sendResponse(true);
    }
  };

  function renderUnLogin() {
    if (forceUpgradeInfo) {
      return <div dangerouslySetInnerHTML={{ __html: forceUpgradeInfo }} />;
    }
    return <Login onConfirm={onLogin} />;
  }

  useEffect(() => {
    Chrome.runtime.onMessage.addListener(onReceiveMessage);
    return () => {
      Chrome.runtime.onMessage.removeListener(onReceiveMessage);
    };
  }, [ editorValue ]);

  const [ tab, setTab ] = React.useState<TabName>('save-to');

  const handleTabChange = (e: RadioChangeEvent) => {
    setTab(e.target.value as unknown as TabName);
  };

  const isLogined = account?.id;

  if (!appReady) return null;

  return (
    <EditorValueContext.Provider
      value={{ editorValue, currentType, setEditorValue, setCurrentType }}
    >
      <div className={styles.wrapper}>
        {
          account?.id
            ? <div className={styles.header}>{__i18n('语雀剪藏')}</div>
            : null
        }
        <CloseOutlined className={styles.close} onClick={onClose} />
        <div className={classnames(styles.items, {
          [styles.unlogin]: !isLogined,
        })}>
          {isLogined ? (
            <>
              <Radio.Group value={tab} onChange={handleTabChange} style={{ marginBottom: 16 }}>
                <Radio.Button value="save-to">{__i18n('剪藏')}</Radio.Button>
                <Radio.Button value="other">{__i18n('其他')}</Radio.Button>
              </Radio.Group>
              {
                tab === 'save-to'
                  ? <SaveTo onLogout={onLogout} />
                  : <Other />
              }
            </>
          ) : (
            renderUnLogin()
          )}
        </div>
        {account?.id && (
          <div className={styles.account}>
            <FeedBack />
            <UserInfo user={account} onLogout={onLogout} />
          </div>
        )}
      </div>
    </EditorValueContext.Provider>
  );
};

const ThemedApp: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00B96B',
        },
      }}
    >
      <App />
    </ConfigProvider>
  );
};

export default ThemedApp;
