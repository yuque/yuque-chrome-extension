import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { screenShot } from '@/core/screen-shot';
import { useForceUpdate } from '@/hooks/useForceUpdate';
import { useEnterShortcut } from '@/hooks/useEnterShortCut';
import DragResizeCircle, {
  DragResizeCircleDirection,
} from './DragResizeCircle';
import DragMoveArea, { IMoveParams } from './DragMoveArea';
import styles from './app.module.less';

export interface IAppProps {
  onScreenSuccess: (blob: string | null) => void;
  onScreenCancel: () => void;
}

function App(props: IAppProps) {
  const isScreenshot = useRef(false);
  const loadingRef = useRef(false);
  const ref = useRef<HTMLDivElement>(null);
  const [screenShowAreaIsInit, setScreenShowAreaIsInit] = useState(false);
  const startRef = useRef({ left: 0, top: 0 });
  const endRef = useRef({ left: 0, top: 0 });
  const { forceUpdate } = useForceUpdate();
  const [isDragging, setIsDragging] = useState(false);
  const selectAreaWidth = Math.abs(endRef.current.left - startRef.current.left);
  const selectAreaHeight = Math.abs(endRef.current.top - startRef.current.top);
  const selectAreaLeft = Math.min(startRef.current.left, endRef.current.left);
  const selectAreaTop = Math.min(startRef.current.top, endRef.current.top);
  const selectAreaRight = selectAreaLeft + selectAreaWidth;
  const selectAreaBottom = selectAreaTop + selectAreaHeight;
  const operatePosition = {
    left: Math.max(selectAreaRight - 72, 0),
    top:
      selectAreaBottom + 40 > window.innerHeight
        ? selectAreaTop + 8
        : selectAreaBottom + 8,
  };

  const onMove = useCallback((params: IMoveParams) => {
    setIsDragging(true);
    const startLeft = startRef.current.left - params.x;
    const startTop = startRef.current.top - params.y;
    const endLeft = endRef.current.left - params.x;
    const endTop = endRef.current.top - params.y;
    if (startLeft > 0 && endLeft < window.innerWidth) {
      startRef.current.left = startLeft;
      endRef.current.left = endLeft;
    }
    if (startTop > 0 && endTop < window.innerHeight) {
      startRef.current.top = startTop;
      endRef.current.top = endTop;
    }
    forceUpdate();
  }, []);

  const onDrag = useCallback(
    (
      e: React.DragEvent<HTMLDivElement>,
      direction: DragResizeCircleDirection,
      resetPosition?: boolean,
    ) => {
      setIsDragging(true);
      switch (direction) {
        case 'topLeft': {
          startRef.current.left = e.clientX;
          startRef.current.top = e.clientY;
          break;
        }
        case 'topCenter': {
          startRef.current.top = e.clientY;
          break;
        }
        case 'topRight': {
          endRef.current.left = e.clientX;
          startRef.current.top = e.clientY;
          break;
        }
        case 'leftCenter': {
          startRef.current.left = e.clientX;
          break;
        }
        case 'rightCenter': {
          endRef.current.left = e.clientX;
          break;
        }
        case 'bottomLeft': {
          startRef.current.left = e.clientX;
          endRef.current.top = e.clientY || window.innerHeight;
          break;
        }
        case 'bottomCenter': {
          endRef.current.top = e.clientY || window.innerHeight;
          break;
        }
        case 'bottomRight': {
          endRef.current.left = e.clientX || window.innerWidth;
          endRef.current.top = e.clientY || window.innerHeight;
          break;
        }
        default: {
          break;
        }
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

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const onScreenshot = useCallback(async () => {
    if (loadingRef.current) {
      return;
    }
    loadingRef.current = true;
    forceUpdate();
    // 延迟 100ms 将提示给隐藏掉，避免截屏是截上
    await new Promise(resolve => {
      setTimeout(() => {
        resolve(true);
      }, 100);
    });
    try {
      const canvas = await screenShot({
        x: startRef.current.left,
        y: startRef.current.top,
        width: Math.abs(endRef.current.left - startRef.current.left),
        height: Math.abs(endRef.current.top - startRef.current.top),
      });
      const res = canvas.toDataURL('image/png');
      loadingRef.current = false;
      forceUpdate();
      props.onScreenSuccess(res);
    } catch (error) {
      loadingRef.current = false;
      forceUpdate();
      props.onScreenSuccess(null);
    }
  }, []);

  useEnterShortcut({
    onCancel: props.onScreenCancel,
    onOk: onScreenshot,
  });

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

  if (loadingRef.current) {
    return null;
  }

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
          left: '0',
          top: '0',
          bottom: '0',
          width: `${selectAreaLeft}px`,
        }}
      />
      <div
        className={styles.screenBackgroundTop}
        style={{
          left: `${selectAreaLeft}px`,
          top: '0',
          height: `${selectAreaTop}px`,
          width: `${selectAreaRight - selectAreaLeft}px`,
        }}
      />
      <div
        className={styles.screenBackgroundRight}
        style={{
          left: `${selectAreaRight}px`,
          right: '0',
          top: '0',
          bottom: '0',
        }}
      />
      <div
        className={styles.screenBackgroundBottom}
        style={{
          left: `${selectAreaLeft}px`,
          width: `${selectAreaRight - selectAreaLeft}px`,
          top: `${selectAreaBottom}px`,
          bottom: '0',
        }}
      />
      <DragMoveArea
        style={{
          left: `${selectAreaLeft}px`,
          top: `${selectAreaTop}px`,
          width: `${selectAreaWidth}px`,
          height: `${selectAreaHeight}px`,
        }}
        handleDragEnd={handleDragEnd}
        onMove={onMove}
      >
        <DragResizeCircle
          direction="topLeft"
          handleDragEnd={handleDragEnd}
          updatePosition={(e, resetPosition) =>
            onDrag(e, 'topLeft', resetPosition)
          }
        />
        <DragResizeCircle
          direction="topCenter"
          handleDragEnd={handleDragEnd}
          updatePosition={(e, resetPosition) =>
            onDrag(e, 'topCenter', resetPosition)
          }
        />
        <DragResizeCircle
          direction="topRight"
          handleDragEnd={handleDragEnd}
          updatePosition={(e, resetPosition) =>
            onDrag(e, 'topRight', resetPosition)
          }
        />
        <DragResizeCircle
          direction="leftCenter"
          handleDragEnd={handleDragEnd}
          updatePosition={(e, resetPosition) =>
            onDrag(e, 'leftCenter', resetPosition)
          }
        />
        <DragResizeCircle
          direction="rightCenter"
          handleDragEnd={handleDragEnd}
          updatePosition={(e, resetPosition) =>
            onDrag(e, 'rightCenter', resetPosition)
          }
        />
        <DragResizeCircle
          direction="bottomLeft"
          handleDragEnd={handleDragEnd}
          updatePosition={(e, resetPosition) =>
            onDrag(e, 'bottomLeft', resetPosition)
          }
        />
        <DragResizeCircle
          direction="bottomCenter"
          handleDragEnd={handleDragEnd}
          updatePosition={(e, resetPosition) =>
            onDrag(e, 'bottomCenter', resetPosition)
          }
        />
        <DragResizeCircle
          direction="bottomRight"
          handleDragEnd={handleDragEnd}
          updatePosition={(e, resetPosition) =>
            onDrag(e, 'bottomRight', resetPosition)
          }
        />
      </DragMoveArea>
      {!isDragging && screenShowAreaIsInit && (
        <div
          className={styles.operateBar}
          style={{
            left: `${operatePosition.left}px`,
            top: `${operatePosition.top}px`,
          }}
        >
          <div className={styles.operateItem} onClick={props.onScreenCancel}>
            <CloseOutlined />
          </div>
          <div className={styles.operateItem} onClick={onScreenshot}>
            <CheckOutlined />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
