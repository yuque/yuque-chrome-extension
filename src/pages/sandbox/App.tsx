import React, { useState, useEffect } from 'react';
import { Tabs, message } from 'antd';
import { CloseOutlined, ExperimentOutlined } from '@ant-design/icons';
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
import SaveTo from './SaveTo';
import Login from './Login';
import styles from './App.module.less';
import { EditorValueContext } from './EditorValueContext';

type MessageSender = chrome.runtime.MessageSender;

type SendResponse = (response: any) => void;

interface RequestMessage {
  action: keyof typeof GLOBAL_EVENTS;
  htmls?: string[];
}

initI18N();

const { TabPane } = Tabs;

const useViewModel = () => {
  const [account, setAccount] = useState<IYuqueAccount>();

  const onClose = () => {
    Chrome.tabs.getCurrent((tab: any) => {
      Chrome.tabs.sendMessage(tab.id, {
        action: GLOBAL_EVENTS.CLOSE_BOARD,
      });
    });
  };

  const onLogout = () => {
    clearCurrentAccount().then(() => {
      setAccount(undefined);
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
    const account = await proxy.getMineInfo();
    if (!account) {
      message.error(__i18n('登录失败'));
      return;
    }
    await setCurrentAccount(account);
    setAccount(account);
  };

  useEffect(() => {
    getCurrentAccount().then(account => {
      setAccount(account as IYuqueAccount);
    });
  }, []);

  return {
    state: {
      account,
    },
    onClose,
    onLogout,
    onLogin,
  };
};

const App = () => {
  const [editorValue, setEditorValue] = useState([]);
  const [currentType, setCurrentType] = useState(null);
  const {
    state: { account },
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
        setEditorValue([...editorValue, ...formatMD(value)]);
        setCurrentType('selection');
        sendResponse(true);
        return;
      }
      default:
        sendResponse(true);
    }
  };

  useEffect(() => {
    Chrome.runtime.onMessage.addListener(onReceiveMessage);
    return () => {
      Chrome.runtime.onMessage.removeListener(onReceiveMessage);
    };
  }, [editorValue]);

  return (
    <EditorValueContext.Provider
      value={{ editorValue, currentType, setEditorValue, setCurrentType }}
    >
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <span className={styles.version}>
            v{process.env.VERSION}
            <span className={styles.buildtime}>/{process.env.BUILD_TIME}</span>
          </span>
          <span className={styles.close} onClick={onClose}>
            <CloseOutlined />
          </span>
        </div>
        <div className={styles.items}>
          {account?.id ? (
            <>
              <Tabs defaultActiveKey="save-to" size="small" type="card">
                <TabPane tab={__i18n('剪藏')} key="save-to">
                  <SaveTo />
                </TabPane>
                <TabPane
                  tab={
                    <span>
                      <ExperimentOutlined />
                      {__i18n('其他')}
                    </span>
                  }
                  key="others"
                >
                  {__i18n('即将上新')}
                </TabPane>
              </Tabs>
            </>
          ) : (
            <Login onConfirm={onLogin} />
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
