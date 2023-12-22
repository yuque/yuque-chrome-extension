import React, { ReactElement, useState, useRef, useEffect } from 'react';
import classnames from 'classnames';
import styles from './index.module.less';

export interface DragBarProps {
  children?: ReactElement;
  minWidth: number;
  maxWidth: number;
  width: number;
  className?: string;
  style?: React.CSSProperties;
  onResizeAsideWidth?: (params: { width: number }) => void; // 侧边栏宽度更改时触发的函数
  onResizeEnd?: (width: number) => void; // 拖拽结束时触发的回掉函数
  id?: string;
  // 拖拽方向
  direction?: 'left' | 'right';
}

function DragBar(props: DragBarProps) {
  const {
    minWidth = 44,
    maxWidth = 400,
    width,
    direction = 'left',
    id = 'dragBarContainer',
    onResizeAsideWidth,
    onResizeEnd,
  } = props;
  const [dragging, setDragging] = useState(false);
  const startClientXRef = useRef(0);
  const [sidebarWidth, setSidebarWidth] = useState(width);
  const currenSidebarWidthRef = useRef(sidebarWidth);
  const pxWidth = `${sidebarWidth}px`;

  const calcSideBarWidth = (e: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent) => {
    const startX = startClientXRef.current;
    const endX = e.clientX;
    const changeWidth = direction === 'left' ? startX - endX : endX - startX;
    const currentSideBarWidth = currenSidebarWidthRef.current + changeWidth;
    if (currentSideBarWidth < minWidth) {
      return minWidth;
    }
    if (currentSideBarWidth > maxWidth) {
      return maxWidth;
    }
    return currentSideBarWidth;
  };

  const resizeAsideWidth = (e: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent) => {
    const currentSideBarWidth = calcSideBarWidth(e);
    currenSidebarWidthRef.current = currentSideBarWidth;
    startClientXRef.current = e.clientX;
    onResizeAsideWidth?.({ width: currentSideBarWidth });
    setSidebarWidth(currentSideBarWidth);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent) => {
    setDragging(true);
    startClientXRef.current = e.clientX;
  };

  const handleMouseUp = () => {
    setDragging(false);
    onResizeEnd?.(sidebarWidth);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent> | MouseEvent) => {
    if (!dragging) {
      return;
    }
    resizeAsideWidth(e);
  };

  useEffect(() => {
    setSidebarWidth(width);
  }, [width]);

  return (
    <div
      id={id}
      className={classnames(styles.dragBarContainer, props.className)}
      style={{ ...props.style, width: pxWidth }}
    >
      <div className={styles.dragBarWrapper}>
        {props.children}
        <div
          className={classnames(styles.dragBar, 'dargBar-resize', {
            [styles.dragBarActive]: dragging,
          })}
          style={direction === 'left' ? { left: 0 } : { right: '-6px' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        />
        {dragging && (
          <div
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className={styles.dragBarMask}
            onMouseLeave={() => {
              setDragging(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default DragBar;
