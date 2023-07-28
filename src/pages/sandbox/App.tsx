import React, { useState, useEffect } from 'react';
import { Radio, RadioChangeEvent, Tabs, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import SemverCompare from 'semver-compare';

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
import { VERSION } from '@/config';

import UserInfo, { IYuqueAccount } from './UserInfo';
import FeedBack from './FeedBack';
import SaveTo from './SaveTo';
import Login from './Login';
import styles from './App.module.less';
import { EditorValueContext } from './EditorValueContext';
import { useCheckVersion } from './CheckVersion';

type MessageSender = chrome.runtime.MessageSender;

type SendResponse = (response: any) => void;

interface RequestMessage {
  action: keyof typeof GLOBAL_EVENTS;
  htmls?: string[];
}

initI18N();

const { TabPane } = Tabs;

const useViewModel = () => {
  const [ account, setAccount ] = useState<IYuqueAccount>();
  const [ upgradeInfo, setUpgradeInfo ] = useState<string>();

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
        setUpgradeInfo(data.html);
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
    });
  }, []);

  return {
    state: {
      account,
      upgradeInfo,
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
    state: { account, upgradeInfo },
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
    if (upgradeInfo) {
      return <div dangerouslySetInnerHTML={{ __html: upgradeInfo }} />;
    }
    return <Login onConfirm={onLogin} />;
  }

  useEffect(() => {
    Chrome.runtime.onMessage.addListener(onReceiveMessage);
    return () => {
      Chrome.runtime.onMessage.removeListener(onReceiveMessage);
    };
  }, [ editorValue ]);

  const newVersion = useCheckVersion();
  const needUpgrade = React.useMemo(() => {
    return SemverCompare(newVersion || '', VERSION) === 1;
  }, [ newVersion ]);

  const [ tab, setTab ] = React.useState<TabName>('save-to');

  const handleTabChange = (e: RadioChangeEvent) => {
    setTab(e.target.value as unknown as TabName);
  };

  return (
    <EditorValueContext.Provider
      value={{ editorValue, currentType, setEditorValue, setCurrentType }}
    >
      <div className={styles.wrapper}>
        {/* <div className={styles.header}>
          <div className={styles.versionHit}>
            <span className={styles.version}>
              v{VERSION}
              <span className={styles.buildtime}>/{process.env.BUILD_TIME}</span>
            </span>
            {
              needUpgrade
                ? (
                  <a
                    href="https://www.yuque.com/yuque/yuque-browser-extension/welcome#G8HaG"
                    target='_blank'
                    style={{ marginLeft: 8 }}
                  >
                    {__i18n('升级新版本')}
                    &nbsp;v{newVersion}
                  </a>
                ) : null
            }
          </div>
        </div> */}
        {
          account?.id
            ? <div className={styles.header}>{__i18n('语雀剪藏')}</div>
            : null
        }
        <CloseOutlined className={styles.close} onClick={onClose} />
        <div className={styles.items}>
          {account?.id ? (
            <>
              <Radio.Group value={tab} onChange={handleTabChange} style={{ marginBottom: 16 }}>
                <Radio.Button value="save-to">{__i18n('剪藏')}</Radio.Button>
                <Radio.Button value="other">{__i18n('其他')}</Radio.Button>
              </Radio.Group>
              {
                tab === 'save-to'
                  ? <SaveTo onLogout={onLogout} />
                  : <div>{__i18n('即将上新')}</div>
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

export default App;
