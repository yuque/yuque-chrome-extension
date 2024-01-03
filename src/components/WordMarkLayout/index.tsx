import React, { useEffect, useState } from 'react';
import { IWordMarkConfig, wordMarkConfigManager } from '@/core/configManager/wordMark';
import { IWordMarkContext, WordMarkContext } from './context';

interface IWordMarkLayoutProps {
  children: React.ReactNode;
}

function WordMarkLayout(props: IWordMarkLayoutProps) {
  const [wordMarkConfig, setWordMarkConfig] = useState<IWordMarkContext | null>(null);

  const [wordMarkVisible, setWordMarkVisible] = useState(true);

  const destroyWordMark = () => {
    setWordMarkVisible(false);
  };

  const isEnableWordMark = (config: IWordMarkConfig | null) => {
    if (!wordMarkVisible) {
      return false;
    }
    const url = `${window.location.origin}${window.location.pathname}`;
    if (!config?.enable && config?.evokeWordMarkShortKey) {
      return true;
    }
    const isDisableUrl = config?.disableUrl?.find?.(item => item.origin === url);
    if (!config?.enable || !!isDisableUrl) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    wordMarkConfigManager.get().then(res => {
      setWordMarkConfig(res as any);
    });
  }, []);

  useEffect(() => {
    const removerListener = wordMarkConfigManager.addListener(data => {
      data &&
        setWordMarkConfig({
          ...data,
          destroyWordMark,
        });
    });
    return () => {
      removerListener();
    };
  }, []);

  return (
    <WordMarkContext.Provider
      value={
        {
          ...(wordMarkConfig || {}),
          destroyWordMark,
        } as IWordMarkContext
      }
    >
      {isEnableWordMark(wordMarkConfig) ? props.children : null}
    </WordMarkContext.Provider>
  );
}

export default WordMarkLayout;
