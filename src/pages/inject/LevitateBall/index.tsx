import React from 'react';
import { createRoot } from 'react-dom/client';
import AntdLayout from '@/components/AntdLayout';
import LevitateBallApp from './app';


interface ICreateWordMarkOption {
  dom: HTMLElement;
}

function App() {
  return (
    <AntdLayout>
     <LevitateBallApp />
    </AntdLayout>
  );
}

export function createLevitateBall(option: ICreateWordMarkOption) {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<App />);
  option.dom.appendChild(div);

  return () => {
    root.unmount();
    option.dom.removeChild(div);
  };
}
