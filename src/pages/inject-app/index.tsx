import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import AccountLayout from '@/components/account-layout';
import eventManager from '@/core/event/eventManager';
import { AppEvents } from '@/core/event/events';
import { InjectAppContext } from '@/context/inject-app-context';
import { createRoot } from 'react-dom/client';
import {
  InjectAppType,
  YQ_CLIPPING_APP_CONTAINER,
} from '@/isomorphic/constants';
import { IWordMarkConfig, isEnableWordMark } from '@/isomorphic/word-mark';
import { BACKGROUND_EVENTS, PAGE_EVENTS } from '@/events';
import { sendMessageToBack } from '@/core/bridge/inject-to-background';
import Chrome from '@/core/chrome';
import { RequestMessage } from '@/core/bridge/interface';
import Clipping from './page/clipping';
import WordMark from './page/word-mark';
import Editor, { IEditorRef } from './page/editor';
import AreaSelector from './page/area-selector';
import { getBookmarkHTMLs } from './helper/editor';
import './index.less';

function App() {
  const [ injectAppType, setInjectAppType ] = useState<InjectAppType>(null);
  const [ wordMarkConfig, setWordMarkConfig ] = useState<IWordMarkConfig>(null);
  const [ isSelecting, setIsSelecting ] = useState(false);
  const [ defaultClipType, setDefaultClipType ] = useState(null);
  const editorRef = useRef<IEditorRef>();

  const onSelectSuccess = useCallback(() => {
    setIsSelecting(false);
  }, []);

  useEffect(() => {
    sendMessageToBack(BACKGROUND_EVENTS.GET_WORD_MARK_CONFIG).then(
      (res: IWordMarkConfig) => {
        setWordMarkConfig(res);
      },
    );
  }, []);

  useEffect(() => {
    const listener = (
      request: RequestMessage,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: boolean) => void,
    ) => {
      switch (request.action) {
        case PAGE_EVENTS.SHOW_CLIPPING_BOARD: {
          setInjectAppType(InjectAppType.clipping);
          sendResponse(true);
          break;
        }
        case PAGE_EVENTS.LOGIN_SUCCESS: {
          eventManager.notify(AppEvents.LOGIN_SUCCESS);
          sendResponse(true);
          break;
        }
        case PAGE_EVENTS.GET_SELECTED_TEXT: {
          const { data } = request;
          const { quote } = getBookmarkHTMLs();
          editorRef.current?.appendContent(quote).then(() => {
            editorRef.current?.focusToStart().then(() => {
              editorRef.current?.appendContent(data.HTMLs.join('')).then(() => {
                setDefaultClipType('selection');
                setInjectAppType(InjectAppType.clipping);
              });
            });
          });
          sendResponse(true);
          break;
        }
        default:
          sendResponse(true);
      }
      return true;
    };
    Chrome.runtime.onMessage.addListener(listener);
    return () => {
      Chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  useEffect(() => {
    // 当明确 injectAppType 类型时不做 injectAppType 对更改
    if (injectAppType) {
      return;
    }
    if (isEnableWordMark(wordMarkConfig)) {
      setInjectAppType(InjectAppType.wordMark);
    }
  }, [ wordMarkConfig, injectAppType ]);

  useEffect(() => {
    if (isSelecting) {
      editorRef.current.hiddenIframe();
    }
  }, [ isSelecting ]);

  if (!injectAppType) {
    return null;
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00B96B',
        },
        components: {
          Menu: {
            activeBarBorderWidth: 0,
            itemMarginInline: 0,
          },
        },
      }}
      prefixCls="yuque-chrome-extension"
    >
      <InjectAppContext.Provider
        value={{
          injectAppType,
          wordMarkConfig,
          defaultClipType,
          editorRef,
          updateInjectAppType: setInjectAppType,
          updateWordMarkConfig: setWordMarkConfig,
          startSelect: () => setIsSelecting(true),
        }}
      >
        <AccountLayout>
          <div className={classNames({ hidden: isSelecting })}>
            {injectAppType === InjectAppType.clipping && <Clipping />}
            {injectAppType === InjectAppType.wordMark && <WordMark />}
          </div>
          <Editor ref={editorRef} />
          {isSelecting && <AreaSelector onSelectSuccess={onSelectSuccess} />}
        </AccountLayout>
      </InjectAppContext.Provider>
    </ConfigProvider>
  );
}

export function initInjectApp() {
  let wrapper = document.querySelector(`.${YQ_CLIPPING_APP_CONTAINER}`);
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = YQ_CLIPPING_APP_CONTAINER;
    document.documentElement.appendChild(wrapper);
  }
  const root = createRoot(wrapper);
  root.render(<App />);
}
