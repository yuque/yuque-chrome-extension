import React from 'react';
import { createRoot } from 'react-dom/client';
import WordMarkLayout from '@/components/WordMarkLayout';
import InjectLayout from '../components/InjectLayout';
import WordMarkApp from './app';

interface ICreateWordMarkOption {
  dom: HTMLElement;
}

function App() {
  return (
    <InjectLayout>
      <WordMarkLayout>
        <WordMarkApp />
      </WordMarkLayout>
    </InjectLayout>
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
