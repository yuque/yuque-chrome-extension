import React from 'react';
import { Root, createRoot } from 'react-dom/client';
import App from './app';
import { YQ_INJECT_WORD_MARK_CONTAINER } from '@/isomorphic/constants';

let root: Root;

export function initWordMark() {
  let wrapper = document.querySelector(`.${YQ_INJECT_WORD_MARK_CONTAINER}`);
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = YQ_INJECT_WORD_MARK_CONTAINER;
    document.documentElement.appendChild(wrapper);
  }
  root = createRoot(wrapper);
  root.render(<App />);
}

export function destroyWordMark() {
  const wrapper = document.querySelector(`.${YQ_INJECT_WORD_MARK_CONTAINER}`);
  root.unmount();
  wrapper?.remove();
}


