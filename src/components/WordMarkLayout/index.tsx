import React, { useEffect, useState } from 'react';
import { backgroundBridge } from '@/core/bridge/background';
import {
  WordMarkMessageActions,
  WordMarkMessageKey,
} from '@/isomorphic/event/wordMark';
import { IWordMarkConfig } from '@/isomorphic/constant/wordMark';
import { IWordMarkContext, WordMarkContext } from './context';

interface IWordMarkLayoutProps {
  children: React.ReactNode;
}

function WordMarkLayout(props: IWordMarkLayoutProps) {
  const [wordMarkConfig, setWordMarkConfig] = useState<IWordMarkContext | null>(
    null,
  );

  const isEnableWordMark = (config: IWordMarkConfig | null) => {
    const url = `${window.location.origin}${window.location.pathname}`;
    if (config?.evokeWordMarkShortKey) {
      return true;
    }
    if (!config?.enable || config.disableUrl?.includes(url)) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    backgroundBridge.configManager.get('wordMark').then(res => {
      setWordMarkConfig(res);
    });
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent<any>) => {
      const { key, action, data } = e.data || {};
      if (key !== WordMarkMessageKey) {
        return;
      }
      switch (action) {
        case WordMarkMessageActions.wordMarkConfigUpdate: {
          data && setWordMarkConfig(data);
          break;
        }
        default:
          break;
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, []);

  return (
    <WordMarkContext.Provider value={wordMarkConfig as IWordMarkContext}>
      {isEnableWordMark(wordMarkConfig) ? props.children : null}
    </WordMarkContext.Provider>
  );
}

export default WordMarkLayout;
