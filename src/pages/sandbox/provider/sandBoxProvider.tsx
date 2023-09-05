import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ClippingTypeEnum,
  SandBoxMessageKey,
  SandBoxMessageType,
} from '@/isomorphic/sandbox';
import eventManager from '@/core/event/eventManager';
import { AppEvents } from '@/core/event/events';

interface ISandboxContext {
  defaultSelectHTML: HTMLElement[];
  clippingType: ClippingTypeEnum | null;
  updateClippingType: React.Dispatch<
    React.SetStateAction<ClippingTypeEnum | null>
  >;
}

export const SandboxContext = createContext<ISandboxContext>({
  defaultSelectHTML: [],
  clippingType: null,
  updateClippingType: () => {
    //
  },
});

interface ISandboxProviderProps {
  children?: React.ReactNode;
}

export function SandboxProvider(props: ISandboxProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [defaultSelectHTML, setDefaultSelectHTML] = useState([]);
  const [clippingType, updateClippingType] = useState<ClippingTypeEnum | null>(
    null,
  );

  useEffect(() => {
    const listener = (e: MessageEvent<any>) => {
      if (e.data?.key !== SandBoxMessageKey) {
        return;
      }
      const { action, data } = e.data || {};
      switch (action) {
        case SandBoxMessageType.getSelectedHtml: {
          const { HTMLs, type } = data;
          setDefaultSelectHTML(HTMLs);
          if (type !== undefined) {
            updateClippingType(type);
          }
          setIsReady(true);
          break;
        }
        case SandBoxMessageType.initSandbox: {
          setIsReady(true);
          break;
        }
        default:
          break;
      }
    };
    const onClose = () => {
      setDefaultSelectHTML([]);
      updateClippingType(null);
    }
    window.addEventListener('message', listener);
    eventManager.addListener(AppEvents.CLOSE_BOARD, onClose);
    return () => {
      window.addEventListener('message', listener);
      eventManager.removeListener(AppEvents.CLOSE_BOARD, onClose);
    };
  }, []);
  return (
    <SandboxContext.Provider
      value={{
        defaultSelectHTML,
        clippingType,
        updateClippingType,
      }}
    >
      {isReady && props.children}
    </SandboxContext.Provider>
  );
}

export function useSandboxContext() {
  const context = useContext(SandboxContext);
  return context;
}
