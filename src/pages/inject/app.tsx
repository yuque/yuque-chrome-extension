import React, { useEffect, useRef, useState, createRef, useImperativeHandle, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import classnames from 'classnames';
import { STORAGE_KEYS } from '@/config';
import { storage } from '@/isomorphic/storage';
import { ClipAssistantMessageActions, ClipAssistantMessageKey } from '@/isomorphic/event/clipAssistant';
import { SidePanelMessageActions, SidePanelMessageKey } from '@/isomorphic/event/sidePanel';
import DragBar from '@/components/DragBar';
import WordMarkLayout from '@/components/WordMarkLayout';
import WordMarkApp from './WordMark';
import LevitateBallApp from './LevitateBall';
import InjectLayout, { useInjectContent } from './components/InjectLayout';
import styles from './app.module.less';

export interface ContentScriptAppRef {
  toggleSidePanel: (visible?: boolean) => void;
  addContentToClipAssistant: (html: string) => Promise<void>;
  sendMessageToClipAssistant: (action: ClipAssistantMessageActions, data?: any) => Promise<void>;
  showMessage: (config: ShowMessageConfig) => void;
}

export interface ShowMessageConfig {
  type: 'error' | 'success';
  text: string;
  link?: {
    text: string;
    href: string;
  };
}

const App = React.forwardRef<ContentScriptAppRef>((props, ref) => {
  const [sidePanelVisible, setSidePanelVisible] = useState(false);
  const [sidePanelWidth, setSidePanelWidth] = useState(418);
  const sidePanelIframe = useRef<HTMLIFrameElement>(null);
  const [needLoadSidePanel, setNeedLoadSidePanel] = useState(true);
  const isUsedSidePanelRef = useRef(false);
  const { message } = useInjectContent();
  const sidePanelPromiseRef = useRef(
    new Promise(resolve => {
      const onMessage = (e: MessageEvent<any>) => {
        if (e.data.key !== ClipAssistantMessageKey) {
          return;
        }
        if (e.data.action === ClipAssistantMessageActions.ready) {
          resolve(true);
          window.removeEventListener('message', onMessage);
        }
      };
      window.addEventListener('message', onMessage);
    }),
  );

  const arouseSidePanel = useCallback(() => {
    // 向 iframe 通知一声
    sidePanelIframe.current?.contentWindow?.postMessage(
      {
        key: SidePanelMessageKey,
        action: SidePanelMessageActions.arouse,
      },
      '*',
    );
  }, []);

  const showMessage = useCallback((config: ShowMessageConfig) => {
    const { text, link, type } = config;
    const content = (
      <span className={styles.showMessageWrapper}>
        <span className={styles.showMessageText}>{text}</span>
        {!!link && (
          <a
            target="_blank"
            href={link.href}
            className={styles.showMessageHref}
          >
            {link.text}
          </a>
        )}
      </span>
    );
    message.open({
      type,
      content,
      className: styles.showMessageContainer,
    });
  }, []);

  const toggleSidePanel = useCallback((visible?: boolean) => {
    // 向 iframe 通知一声
    arouseSidePanel();
    isUsedSidePanelRef.current = true;
    if (typeof visible === 'boolean') {
      setSidePanelVisible(visible);
      return;
    }
    setSidePanelVisible(preVisible => !preVisible);
  }, []);

  const sendMessageToClipAssistant = useCallback(async (action: ClipAssistantMessageActions, data?: any) => {
    // 向 iframe 通知一声
    arouseSidePanel();
    await sidePanelPromiseRef.current;
    sidePanelIframe.current?.contentWindow?.postMessage(
      {
        key: ClipAssistantMessageKey,
        action,
        data,
      },
      '*',
    );
  }, []);

  const addContentToClipAssistant = useCallback(async (html: string) => {
    arouseSidePanel();
    await sidePanelPromiseRef.current;
    sendMessageToClipAssistant(ClipAssistantMessageActions.addContent, html);
  }, []);

  useImperativeHandle(ref, () => ({
    toggleSidePanel,
    addContentToClipAssistant,
    sendMessageToClipAssistant,
    showMessage,
  }));

  useEffect(() => {
    // 当页面可见性发生改变时，如果发现用户未使用过插件，释放掉 sidePanel iframe
    const onVisibilitychange = () => {
      if (isUsedSidePanelRef.current) {
        return;
      }
      if (document.hidden) {
        setNeedLoadSidePanel(false);
      } else {
        setNeedLoadSidePanel(true);
      }
    };
    document.addEventListener('visibilitychange', onVisibilitychange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilitychange);
    };
  }, []);

  useEffect(() => {
    storage.get(STORAGE_KEYS.SETTINGS.SIDE_PANEL_CONFIG).then(res => {
      if (res?.width) {
        setSidePanelWidth(res.width);
      }
    });
  }, []);

  return (
    <>
      <DragBar
        minWidth={418}
        maxWidth={window.innerWidth}
        width={sidePanelWidth}
        className={classnames(styles.sidePanelWrapper, {
          [styles.sidePanelWrapperVisible]: sidePanelVisible,
        })}
        onResizeEnd={width => {
          storage.update(STORAGE_KEYS.SETTINGS.SIDE_PANEL_CONFIG, {
            width,
          });
        }}
      >
        <div className={styles.sidePanelIframeWrapper}>
          {needLoadSidePanel && (
            <iframe
              className={styles.sidePanelIframe}
              src={chrome.runtime.getURL('sidePanel.html')}
              id="yq-sidePanel-iframe"
              ref={sidePanelIframe}
            />
          )}
        </div>
      </DragBar>
      <LevitateBallApp />
      <WordMarkLayout>
        <WordMarkApp />
      </WordMarkLayout>
    </>
  );
});

export function createContentScriptApp() {
  const div = document.createElement('div');
  const contentScriptRef = createRef<ContentScriptAppRef>();
  const root = createRoot(div);
  root.render(
    <InjectLayout>
      <App ref={contentScriptRef} />
    </InjectLayout>,
  );
  window._yuque_ext_app.rootContainer.appendChild(div);
  return {
    ref: contentScriptRef,
    remove: () => {
      root.unmount();
      window._yuque_ext_app.rootContainer.removeChild(div);
    },
  };
}
