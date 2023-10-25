import React from 'react';
import { createRoot } from 'react-dom/client';
import WordMarkLayout from '@/components/WordMarkLayout';
import AntdLayout from '@/components/AntdLayout';
import WordMarkApp from './app';

interface ICreateWordMarkOption {
  dom: HTMLElement;
}

function App() {
  return (
    <AntdLayout>
      <WordMarkLayout>
        <WordMarkApp />
      </WordMarkLayout>
    </AntdLayout>
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
