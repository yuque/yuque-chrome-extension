import React from 'react';
import AntdMessage from '@/components/AntdMessage';
import { createRoot } from 'react-dom/client';
import { StyleProvider } from '@ant-design/cssinjs';
import WordMarkLayout from '@/components/WordMarkLayout';
import AntdLayout from '@/components/AntdLayout';
import WordMarkApp from './app';
import '@/styles/global.less';

interface ICreateWordMarkOption {
  dom: HTMLElement;
}

function App() {
  return (
    <StyleProvider container={window._yuque_ext_app.shadowRoot}>
      <AntdLayout
        config={{
          getPopupContainer: () => window._yuque_ext_app.rootContainer,
        }}
      >
        <AntdMessage>
          <WordMarkLayout>
            <WordMarkApp />
          </WordMarkLayout>
        </AntdMessage>
      </AntdLayout>
    </StyleProvider>
  );
}

export function createWordMark(option: ICreateWordMarkOption) {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<App />);
  option.dom.appendChild(div);

  return () => {
    root.unmount();
    option.dom.removeChild(div);
  };
}
