import React, { useEffect, useRef, useCallback, useState } from 'react';
import classnames from 'classnames';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useForceUpdate } from '@/hooks/useForceUpdate';
import { useEnterShortcut } from '@/hooks/useEnterShortCut';
import { parseDom } from '@/core/parseDom';
import { __i18n } from '@/isomorphic/i18n';
import Env from '@/isomorphic/env';
import styles from './app.module.less';

type Rect = Pick<DOMRect, 'width' | 'height' | 'left' | 'top'>;

export interface IAppProps {
  onSelectAreaSuccess: (html: string) => void;
  onSelectAreaCancel: () => void;
}

function App(props: IAppProps) {
  const { forceUpdate } = useForceUpdate();
  const targetRectListRef = useRef<Rect[]>([]);
  const targetRectRef = useRef<Rect | null>();
  const targetRef = useRef<Element | null>();
  const targetListRef = useRef<Array<Element>>([]);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const onSave = useCallback(async () => {
    setSaving(true);
    const selections = targetListRef.current.filter(item => item) || [];
    Env.isRunningHostPage && window._yuque_ext_app.toggleSidePanel(true);
    const selectAreaElements = await parseDom.parseDom(selections);
    props.onSelectAreaSuccess(selectAreaElements.join(''));
  }, []);

  useEnterShortcut({
    onOk: onSave,
    onCancel: props.onSelectAreaCancel,
  });

  useEffect(() => {
    function handleMouseOver(e: MouseEvent) {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      // 跳过遮罩层本身
      if (target === ref.current || !target) {
        return;
      }

      // 跳过插件的元素
      if (target.closest('#yuque-extension-root-container')) {
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
      const target = e.composedPath()?.[0] as Element;
      e.stopImmediatePropagation();
      e.preventDefault();
      if (target.closest('.select-confirm')) {
        onSave();
      } else if (target?.closest('.select-inner')) {
        const key = parseInt(
          target.getAttribute('data-select-index') as string,
        );
        targetRectListRef.current = targetRectListRef.current.filter(
          (__, index) => key !== index,
        );
        targetListRef.current = targetListRef.current.filter(
          (__, index) => key !== index,
        );
      } else {
        if (!targetRectRef.current || !targetRef.current) {
          return;
        }
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
      setTimeout(() => {
        window.focus();
      }, 200);
    };

    window.addEventListener('mouseover', handleMouseOver, true);
    window.addEventListener('click', onToggleSelect, true);
    return () => {
      window.removeEventListener('mouseover', handleMouseOver, true);
      window.removeEventListener('click', onToggleSelect, true);
    };
  }, []);

  if (saving) {
    return null;
  }

  return (
    <>
      <div className={classnames(styles.maskWrapper, 'select-inner')}>
        <InfoCircleOutlined className={styles.icon} />
        {__i18n('单击区域选中，再次点击取消选中，ESC 退出，↩ 完成。')}
        {!!targetRectListRef.current.length && (
          <div
            className={classnames(styles.confirm, 'select-confirm')}
            onClick={e => {
              e.stopPropagation();
              onSave();
            }}
          >
            {__i18n('确认选取')}({targetRectListRef.current.length})
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
      {!!targetRectRef.current?.width && (
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
}

export default App;
