import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';

const importAll = (r: any) => r.keys().forEach(r);
importAll(require.context('@/assets/icons', false, /\.png$/));

const root = createRoot(document.getElementById('ReactApp'));
root.render(<App />);
