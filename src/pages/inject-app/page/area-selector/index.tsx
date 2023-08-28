import React, { useCallback, useEffect, useRef } from 'react';
import Selector, { ISelectorRef } from './Selector';
import eventManager from '@/core/event/eventManager';
import { AppEvents } from '@/core/event/events';

interface IAreaSelectorProps {
  onSelectSuccess: () => void;
}

function AreaSelector(props: IAreaSelectorProps) {
  const selectorRef = useRef<ISelectorRef>();
  const onSave = useCallback(async () => {
    const selectAreaElements = selectorRef.current.getSelections();
    const HTMLs = Array.from(selectAreaElements).map(elem => {
      if (elem?.nodeName === 'CANVAS') {
        try {
          return `<img src="${(elem as HTMLCanvasElement).toDataURL()}">`;
        } catch (e) {
          return '';
        }
      }
      return elem?.outerHTML;
    });
    eventManager.notify(AppEvents.GET_SELECTED_HTML, {
      HTMLs,
    });
    props.onSelectSuccess();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      window.focus();
    }, 300);
    const handleKeyDown = (e: KeyboardEvent) => {
      const { key } = e;
      if (key === 'Escape' || key === 'Esc') {
        //
        // destroySelectArea();
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

export default React.memo(AreaSelector);
