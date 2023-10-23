import React, { useEffect, useState } from 'react';
import { backgroundBridge } from '@/core/bridge/background';
import {
  WordMarkMessageActions,
  WordMarkMessageKey,
} from '@/isomorphic/event/wordMark';
import { isEnableWordMark } from '@/isomorphic/word-mark';
import { IWordMarkContext, WordMarkContext } from './context';

interface IWordMarkLayoutProps {
  children: React.ReactNode;
}

function WordMarkLayout(props: IWordMarkLayoutProps) {
  const [wordMarkConfig, setWordMarkConfig] = useState<IWordMarkContext | null>(
    null,
  );
  useEffect(() => {
    backgroundBridge.wordMarkConfig.get().then(res => {
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
