import React, { useCallback, useEffect, useRef } from 'react';
import { Root, createRoot } from 'react-dom/client';
import Chrome from '@/core/chrome';
import Selector, { ISelectorRef } from './selector/Selector';
import { YQ_SANDBOX_BOARD_IFRAME, YQ_SELECTION_CONTAINER } from '@/isomorphic/constants';
import { GLOBAL_EVENTS } from '@/events';

function App() {
  const selectorRef = useRef<ISelectorRef>();
  const onSave = useCallback(() => {
    const selectAreaElements = selectorRef.current.getSelections();
    const HTMLs = Array.from(selectAreaElements).map(elem => {
      if (elem?.nodeName === 'CANVAS') {
        try {
          return `<img src="${(elem as HTMLCanvasElement).toDataURL()}">`;
        } catch (e) {
          return '';
        }
      }
      return elem?.outerHTML
    }
    );
    Chrome.runtime.sendMessage(
      {
        action: GLOBAL_EVENTS.GET_SELECTED_HTML,
        HTMLs,
      },
      () => {
        const iframe =  document.querySelector(`#${YQ_SANDBOX_BOARD_IFRAME}`) as HTMLDivElement;
        iframe.classList.add('show');
        iframe.focus();
        destroySelectArea();
      },
    );
  }, []);

  useEffect(() => {
    setTimeout(() => {
      window.focus();
    }, 300);
    const handleKeyDown = (e: KeyboardEvent) => {
      const { key } = e;
      if (key === 'Escape' || key === 'Esc') {
        destroySelectArea();
      } else if (key === 'Enter') {
        onSave();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ onSave ]);

  return <Selector onSave={onSave} ref={selectorRef} />;
}

let root: Root;

export function initSelectArea() {
  let wrapper = document.querySelector(`#${YQ_SELECTION_CONTAINER}`);
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.id = YQ_SELECTION_CONTAINER;
    document.documentElement.appendChild(wrapper);
  }
  root = createRoot(wrapper);
  root.render(<App />);
}

export function destroySelectArea() {
  const wrapper = document.querySelector(`#${YQ_SELECTION_CONTAINER}`);
  root.unmount();
  wrapper?.remove();
  document.querySelector(`#${YQ_SANDBOX_BOARD_IFRAME}`)?.classList.add('show');
}
