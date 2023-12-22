import React, { useEffect, useRef, useState, createRef, useImperativeHandle, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import classnames from 'classnames';
import { STORAGE_KEYS } from '@/config';
import DragBar from '@/components/DragBar';
import { backgroundBridge } from '@/core/bridge/background';
import { ClipAssistantMessageActions, ClipAssistantMessageKey } from '@/isomorphic/event/clipAssistant';
import { SidePanelMessageActions, SidePanelMessageKey } from '@/isomorphic/event/sidePanel';
import LevitateBallApp from './LevitateBall';
import InjectLayout from './components/InjectLayout';
import styles from './app.module.less';

export interface ContentScriptAppRef {
  toggleSidePanel: (visible?: boolean) => void;
  addContentToClipAssistant: (html: string) => Promise<void>;
  sendMessageToClipAssistant: (action: ClipAssistantMessageActions, data?: any) => Promise<void>;
}

const App = React.forwardRef<ContentScriptAppRef>((props, ref) => {
  const [sidePanelVisible, setSidePanelVisible] = useState(false);
  const [sidePanelWidth, setSidePanelWidth] = useState(418);
  const sidePanelIframe = useRef<HTMLIFrameElement>(null);
  const [needLoadSidePanel, setNeedLoadSidePanel] = useState(true);
  const isUsedSidePanelRef = useRef(false);
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
    backgroundBridge.storage.get(STORAGE_KEYS.SETTINGS.SIDE_PANEL_CONFIG).then(res => {
      if (res?.width) {
        setSidePanelWidth(res.width);
      }
    });
  }, []);

  return (
    <InjectLayout>
      <DragBar
        minWidth={418}
        maxWidth={window.innerWidth}
        width={sidePanelWidth}
        className={classnames(styles.sidePanelWrapper, {
          [styles.sidePanelWrapperVisible]: sidePanelVisible,
        })}
        onResizeEnd={width => {
          backgroundBridge.storage.update(STORAGE_KEYS.SETTINGS.SIDE_PANEL_CONFIG, {
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
    </InjectLayout>
  );
});

export function createContentScriptApp() {
  const div = document.createElement('div');
  const contentScriptRef = createRef<ContentScriptAppRef>();
  const root = createRoot(div);
  root.render(<App ref={contentScriptRef} />);
  window._yuque_ext_app.rootContainer.appendChild(div);
  return {
    ref: contentScriptRef,
    remove: () => {
      root.unmount();
      window._yuque_ext_app.rootContainer.removeChild(div);
    },
  };
}
