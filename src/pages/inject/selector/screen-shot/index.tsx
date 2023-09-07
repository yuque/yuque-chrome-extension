import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Spin } from 'antd';
import html2canvas from 'html2canvas';
import classnames from 'classnames';
import { useForceUpdate } from '@/hooks/useForceUpdate';
import { SandBoxMessageType } from '@/isomorphic/sandbox';
import { sendMessageToSandBox } from '@/core/bridge/sendMessageToSandbox';
import DragLine from './drag-line';
import styles from './index.module.less';

type DragDirection = 'top' | 'bottom' | 'left' | 'right';

export interface IScreenShotRef {
  onSave: () => Promise<void>;
}

export default forwardRef<IScreenShotRef, {}>((_, propsRef) => {
  const isScreenshot = useRef(false);
  const loadingRef = useRef(false);
  const ref = useRef<HTMLDivElement>(null);
  const [screenShowAreaIsInit, setScreenShowAreaIsInit] = useState(false);
  const startRef = useRef({ left: 0, top: 0 });
  const endRef = useRef({ left: 0, top: 0 });
  const { forceUpdate } = useForceUpdate();
  const selectAreaWidth = Math.abs(endRef.current.left - startRef.current.left);
  const selectAreaHeight = Math.abs(endRef.current.top - startRef.current.top);
  const selectAreaLeft = Math.min(startRef.current.left, endRef.current.left);
  const selectAreaTop = Math.min(startRef.current.top, endRef.current.top);
  const selectAreaRight = selectAreaLeft + selectAreaWidth;
  const selectAreaBottom = selectAreaTop + selectAreaHeight;

  useEffect(() => {
    if (screenShowAreaIsInit) {
      return;
    }
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        return;
      }
      isScreenshot.current = true;
      startRef.current = {
        left: e.clientX,
        top: e.clientY,
      };
    };
    const onMouseUp = () => {
      if (isScreenshot.current && endRef.current.left && endRef.current.top) {
        setScreenShowAreaIsInit(true);
      }
      isScreenshot.current = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isScreenshot.current) {
        return;
      }
      endRef.current = {
        left: e.clientX,
        top: e.clientY,
      };
      forceUpdate();
    };
    ref.current?.addEventListener('mousedown', onMouseDown);
    ref.current?.addEventListener('mouseup', onMouseUp);
    ref.current?.addEventListener('mousemove', onMouseMove);
    ref.current?.addEventListener('mouseleave', onMouseUp);

    return () => {
      ref.current?.removeEventListener('mousedown', onMouseDown);
      ref.current?.removeEventListener('mousemove', onMouseMove);
      ref.current?.removeEventListener('mouseup', onMouseUp);
      ref.current?.addEventListener('mouseleave', onMouseUp);
    };
  }, [screenShowAreaIsInit]);

  const onDrag = useCallback(
    (
      e: React.DragEvent<HTMLDivElement>,
      direction: DragDirection,
      resetPosition?: boolean,
    ) => {
      switch (direction) {
        case 'left': {
          startRef.current.left = e.clientX;
          break;
        }
        case 'right': {
          endRef.current.left = e.clientX || window.innerWidth;
          break;
        }
        case 'top': {
          startRef.current.top = e.clientY;
          break;
        }
        case 'bottom': {
          endRef.current.top = e.clientY || window.innerHeight;
          break;
        }
        default:
          break;
      }
      if (resetPosition) {
        // 计算完成后做一次 endRef 和 startRef 的数据订正
        const endPosition = {
          left: Math.max(endRef.current.left, startRef.current.left),
          top: Math.max(endRef.current.top, startRef.current.top),
        };
        const startPosition = {
          left: Math.min(endRef.current.left, startRef.current.left),
          top: Math.min(endRef.current.top, startRef.current.top),
        };
        endRef.current = endPosition;
        startRef.current = startPosition;
      }
      forceUpdate();
    },
    [],
  );

  const onScreenshot = useCallback(async () => {
    if (loadingRef.current) {
      return;
    }
    loadingRef.current = true;
    forceUpdate();
    const canvas = await html2canvas(document.body, {
      useCORS: true,
      allowTaint: false,
      scrollX: -window.scrollX, // 水平滚动的偏移量
      scrollY: -window.scrollY, // 垂直滚动的偏移量
      windowWidth: document.documentElement.offsetWidth, // 窗口的宽度
      windowHeight: document.documentElement.offsetHeight, // 窗口的高度
      x: startRef.current.left + window.scrollX, // 选取范围的左上角横坐标
      y: startRef.current.top + window.scrollY, // 选取范围的左上角纵坐标
      width: Math.abs(endRef.current.left - startRef.current.left),
      height: Math.abs(endRef.current.top - startRef.current.top),
    });
    try {
      canvas.toBlob(res => {
        sendMessageToSandBox(SandBoxMessageType.startOcr, {
          blob: res,
        });
        loadingRef.current = false;
        forceUpdate();
      });
    } catch (error) {
      loadingRef.current = false;
      forceUpdate();
      sendMessageToSandBox(SandBoxMessageType.startOcr, {
        blob: '',
      });
    }
  }, []);

  useImperativeHandle(
    propsRef,
    () => ({
      onSave: onScreenshot,
    }),
    [onScreenshot],
  );

  return (
    <div
      className={classnames(styles.screenShotWrapper, {
        [styles.enableSelect]: !screenShowAreaIsInit,
      })}
      ref={ref}
    >
      <div
        className={styles.screenBackgroundLeft}
        style={{
          left: `0px`,
          top: `0px`,
          bottom: `0px`,
          width: `${selectAreaLeft}px`,
        }}
      />
      <div
        className={styles.screenBackgroundTop}
        style={{
          left: `${selectAreaLeft}px`,
          top: `0px`,
          height: `${selectAreaTop}px`,
          width: `${selectAreaRight - selectAreaLeft}px`,
        }}
      />
      <div
        className={styles.screenBackgroundRight}
        style={{
          left: `${selectAreaRight}px`,
          right: `0px`,
          top: `0px`,
          bottom: `0px`,
        }}
      />
      <div
        className={styles.screenBackgroundBottom}
        style={{
          left: `${selectAreaLeft}px`,
          width: `${selectAreaRight - selectAreaLeft}px`,
          top: `${selectAreaBottom}px`,
          bottom: `0px`,
        }}
      />
      <div
        className={styles.area}
        id="yq-area"
        style={{
          left: `${selectAreaLeft}px`,
          top: `${selectAreaTop}px`,
          width: `${selectAreaWidth}px`,
          height: `${selectAreaHeight}px`,
        }}
      >
        <DragLine
          width={selectAreaWidth}
          height={2}
          updatePosition={(e, resetPosition) => onDrag(e, 'top', resetPosition)}
          direction="top"
        />
        <DragLine
          width={selectAreaWidth}
          height={2}
          updatePosition={(e, resetPosition) =>
            onDrag(e, 'bottom', resetPosition)
          }
          direction="bottom"
        />

        <DragLine
          width={2}
          height={selectAreaHeight}
          updatePosition={(e, resetPosition) =>
            onDrag(e, 'left', resetPosition)
          }
          direction="left"
          key="left"
        />
        <DragLine
          width={2}
          height={selectAreaHeight}
          updatePosition={(e, resetPosition) =>
            onDrag(e, 'right', resetPosition)
          }
          direction="right"
          key="right"
        />
      </div>
      {!loadingRef.current && (
        <div className={styles.mask} onClick={onScreenshot}>
          {__i18n('ESC 退出， ↲ 完成')}
          <div
            className={classnames(styles.confirm, 'select-confirm')}
            onClick={onScreenshot}
          >
            {__i18n('确认截图')}
          </div>
        </div>
      )}
      {loadingRef.current && <Spin className={styles.loading} spinning />}
    </div>
  );
});
