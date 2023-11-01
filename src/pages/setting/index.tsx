import React from 'react';
import { createRoot } from 'react-dom/client';
import AntdLayout from '@/components/AntdLayout';
import AccountLayout from '@/components/AccountLayout';
import App from './app';

const importAll = (r: any) => r.keys().forEach(r);
importAll(require.context('@/assets/icons', false, /\.png$/));

const root = createRoot(document.getElementById('ReactApp') as Element);
root.render(
  <AntdLayout>
    <AccountLayout>
      <App />
    </AccountLayout>
  </AntdLayout>,
);
