import React, { useEffect, useState } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { message } from 'antd';
import { i18n } from '@/isomorphic/i18n';
import { YUQUE_DOMAIN } from '@/config';
import { YQ_INJECT_WORD_MARK_CONTAINER } from '@/isomorphic/constants';
import Chrome from '@/core/chrome';
import { BACKGROUND_EVENTS, PAGE_EVENTS } from '@/events';
import { IWordMarkConfig } from '@/core/account';
import { IWordMarkContext, WordMarkContext } from '@/context/word-mark-context';
import { RequestMessage } from '@/core/action-listener';
import { disableWordMarkKey } from './constants';
import App from './app';

let root: Root;

interface AppContextProps {
  resource: IWordMarkContext['resource'];
}

function AppContext(props: AppContextProps) {
  const [ defaultConfig, setDefaultConfig ] = useState<IWordMarkConfig>(null);
  useEffect(() => {
    Chrome.runtime.sendMessage(
      {
        action: BACKGROUND_EVENTS.GET_WORD_MARK_CONFIG,
      },
      (res: IWordMarkConfig) => {
        setDefaultConfig(res);
      },
    );
  }, []);

  if (
    !defaultConfig?.enable ||
    window.sessionStorage.getItem(disableWordMarkKey) === 'true'
  ) {
    return;
  }

  return (
    <WordMarkContext.Provider
      value={{
        ...defaultConfig,
        destroyWordMark,
        resource: props.resource,
      }}
    >
      <App />
    </WordMarkContext.Provider>
  );
}

export function initWordMark(props: AppContextProps) {
  let wrapper = document.querySelector(`.${YQ_INJECT_WORD_MARK_CONTAINER}`);
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = YQ_INJECT_WORD_MARK_CONTAINER;
    document.documentElement.appendChild(wrapper);
  }
  root = createRoot(wrapper);
  root.render(<AppContext {...props} />);
}

export function destroyWordMark() {
  if (!root) {
    return;
  }
  const wrapper = document.querySelector(`.${YQ_INJECT_WORD_MARK_CONTAINER}`);
  root.unmount();
  wrapper?.remove();
}

Chrome.runtime.onMessage.addListener(
  (
    request: RequestMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: boolean) => void,
  ) => {
    switch (request.action) {
      case PAGE_EVENTS.DISABLE_WORD_MARK:
        destroyWordMark();
        sendResponse(true);
        break;
      case PAGE_EVENTS.FORCE_UPGRADE_VERSION:
        message.error({
          content: (
            <span>
              {i18n('当前浏览器插件版本过低')}
              <a
                href={`${YUQUE_DOMAIN}/download`}
                target={'_blank'}
                style={{
                  color: '#00B96B',
                  marginLeft: '8px',
                }}
              >
                {i18n('前往升级')}
              </a>
            </span>
          ),
        });
        break;
      default:
        sendResponse(true);
    }
    return true;
  },
);
