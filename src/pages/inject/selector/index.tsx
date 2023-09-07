import React, { useEffect, useRef } from 'react';
import { Root, createRoot } from 'react-dom/client';
import {
  StartSelectEnum,
  YQ_SANDBOX_BOARD_IFRAME,
  YQ_SELECTION_CONTAINER,
} from '@/isomorphic/constants';
import Selector, { ISelectorRef } from './area-selector';
import ScreenShot, { IScreenShotRef } from './screen-shot';
import { ConfigProvider } from 'antd';

interface IAppProps {
  type?: StartSelectEnum;
}

function App(props: IAppProps) {
  const { type = StartSelectEnum.areaSelect } = props;
  const screenShotRef = useRef<IScreenShotRef>(null);
  const selectorRef = useRef<ISelectorRef>(null);

  useEffect(() => {
    setTimeout(() => {
      window.focus();
    }, 300);
    const handleKeyDown = async (e: KeyboardEvent) => {
      const { key } = e;
      if (key === 'Escape' || key === 'Esc') {
        destroySelectArea();
      } else if (key === 'Enter') {
        if (type === StartSelectEnum.screenShot) {
          await screenShotRef.current?.onSave();
          destroySelectArea();
        } else if (type === StartSelectEnum.areaSelect) {
          selectorRef.current?.onSave();
          destroySelectArea();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00B96B',
        },
      }}
    >
      {type === StartSelectEnum.areaSelect && <Selector ref={selectorRef} />}
      {type === StartSelectEnum.screenShot && (
        <ScreenShot ref={screenShotRef} />
      )}
    </ConfigProvider>
  );
}

let root: Root;

export function initSelectArea(params: { type: StartSelectEnum }) {
  let wrapper = document.querySelector(`#${YQ_SELECTION_CONTAINER}`);
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = YQ_SELECTION_CONTAINER;
    document.documentElement.appendChild(wrapper);
  }
  root = createRoot(wrapper);
  root.render(<App type={params.type} />);
}

export function destroySelectArea() {
  if (!root) {
    return;
  }
  const wrapper = document.querySelector(`#${YQ_SELECTION_CONTAINER}`);
  root.unmount();
  wrapper?.remove();
  document.querySelector(`#${YQ_SANDBOX_BOARD_IFRAME}`)?.classList.add('show');
}
