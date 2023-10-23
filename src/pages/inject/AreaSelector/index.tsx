import React from 'react';
import { createRoot } from 'react-dom/client';
import App, { IAppProps } from './app';

interface IShowSelectAreaOptions extends IAppProps {
  dom: HTMLElement;
}

export function showSelectArea(option: IShowSelectAreaOptions) {
  const div = document.createElement('div');
  const root = createRoot(div);
  const remove = () => {
    root.unmount();
    option.dom.removeChild(div);
  };
  root.render(
    <App
      onSelectAreaCancel={() => {
        option.onSelectAreaCancel();
        remove();
      }}
      onSelectAreaSuccess={html => {
        option.onSelectAreaSuccess(html);
        remove();
      }}
    />,
  );
  option.dom.appendChild(div);
}
