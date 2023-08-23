import React, {
  forwardRef,
  useEffect,
  useRef,
  useImperativeHandle,
} from 'react';
import classnames from 'classnames';
import { useForceUpdate } from '@/hooks/useForceUpdate';
import styles from './Selector.module.less';

type Rect = Pick<DOMRect, 'width' | 'height' | 'left' | 'top'>;

export interface ISelectorProps {
  onSave: () => void;
}

export interface ISelectorRef {
  getSelections: () => Array<Element>;
}

export default forwardRef<ISelectorRef, ISelectorProps>((props, propsRef) => {
  const { forceUpdate } = useForceUpdate();
  const targetRectListRef = useRef<Rect[]>([]);
  const targetRectRef = useRef<Rect | null>();
  const targetRef = useRef<Element>();
  const targetListRef = useRef<Array<Element>>([]);
  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    function handleMouseOver(e: MouseEvent) {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      // 跳过遮罩层本身
      if (target === ref.current || !target) {
        return;
      }

      // 如果选中元素已经被选中不再选中
      if (targetListRef.current.find(item => item === target)) {
        return;
      }

      // 选中的目标是背景的话不会被选中
      if (target?.closest('.select-inner')) {
        return;
      }

      if (typeof target?.getBoundingClientRect !== 'function') {
        return;
      }

      const scrollbarHeight = document.documentElement.scrollTop;
      const scrollbarWidth = document.documentElement.scrollLeft;

      const { width, height, left, top } = target.getBoundingClientRect();
      targetRef.current = target;
      targetRectRef.current = {
        width,
        height,
        left: left + scrollbarWidth,
        top: top + scrollbarHeight,
      };
      forceUpdate();
    }

    const onToggleSelect = (e: MouseEvent) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      const target = e.target as Element;
      if (target.closest('.select-confirm')) {
        props.onSave();
      } else if (target?.closest('.select-inner')) {
        const key = parseInt(target.getAttribute('data-select-index'));
        targetRectListRef.current = targetRectListRef.current.filter(
          (__, index) => key !== index,
        );
        targetListRef.current = targetListRef.current.filter(
          (__, index) => key !== index,
        );
      } else {
        targetRectListRef.current = [
          ...targetRectListRef.current.filter((__, index) => {
            return !targetRef.current?.contains(targetListRef.current[index]);
          }),
          targetRectRef.current,
        ];
        targetListRef.current = [
          ...targetListRef.current.filter((__, index) => {
            return !targetRef.current?.contains(targetListRef.current[index]);
          }),
          targetRef.current,
        ];
        targetRef.current = null;
        targetRectRef.current = null;
      }
      forceUpdate();
    };

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('click', onToggleSelect, true);
    return () => {
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('click', onToggleSelect, true);
    };
  }, [props.onSave]);

  useImperativeHandle(
    propsRef,
    () => ({
      getSelections: () => {
        return targetListRef.current;
      },
    }),
    [],
  );


  return (
    <>
      <div className={classnames(styles.mask, 'select-inner')}>
        单击区域以选中，再次单击取消选中。ESC 退出， ↲ 完成
        {!!targetRectListRef.current.length && (
          <div className={classnames(styles.confirm, 'select-confirm')} onClick={props.onSave}>
            确认选取({targetRectListRef.current.length})
          </div>
        )}
      </div>
      {targetRectListRef.current.map((item, index) => {
        return (
          item?.width && (
            <div
              className={classnames(
                styles.selectInner,
                styles.selected,
                'select-inner',
              )}
              style={{
                ...item,
                pointerEvents: 'all',
              }}
              key={index}
              data-select-index={index}
            />
          )
        );
      })}
      {targetRectRef.current?.width && (
        <div
          ref={ref}
          className={styles.selectInner}
          style={{
            ...targetRectRef.current,
          }}
        />
      )}
    </>
  );
});
