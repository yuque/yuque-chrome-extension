import React from 'react';
import App, { IAppProps } from './app';
import { createRoot } from 'react-dom/client';

interface IShowScreenShotOptions extends IAppProps {
  dom: HTMLElement;
}

export function showScreenShot(option: IShowScreenShotOptions) {
  const div = document.createElement('div');
  const root = createRoot(div);
  const remove = () => {
    root.unmount();
    option.dom.removeChild(div);
  };
  root.render(
    <App
      onScreenCancel={() => {
        option.onScreenCancel();
        remove();
      }}
      onScreenSuccess={blob => {
        remove();
        option.onScreenSuccess(blob);
      }}
    />,
  );
  option.dom.appendChild(div);
}
