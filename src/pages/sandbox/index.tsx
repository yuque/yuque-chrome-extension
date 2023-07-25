import React from 'react';
import { createRoot } from 'react-dom/client';
import 'antd/dist/antd.css';
import './index.module.less';

import App from './App';

const importAll = (r: any) => r.keys().forEach(r);
importAll(require.context('@/assets/icons', false, /\.png$/));

const root = createRoot(document.getElementById('ReactApp'));
root.render(<App />);
