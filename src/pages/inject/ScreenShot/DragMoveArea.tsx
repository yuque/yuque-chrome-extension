import React, { useRef, useState } from 'react';
import styles from './DragMoveArea.module.less';

export interface IMoveParams {
  x: number;
  y: number;
}

interface IDragResizeCircleProps {
  onMove?: (params: IMoveParams) => void;
  handleDragEnd: () => void;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const DragMoveArea = (props: IDragResizeCircleProps) => {
  const { onMove } = props;
  const [dragging, setDragging] = useState(false);
  const positionRef = useRef({ startX: 0, startY: 0 });

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    positionRef.current = { startX: event.clientX, startY: event.clientY };
    setDragging(true);
  };

  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    if (!dragging || !event.clientX || !event.clientY) return;
    const distance = {
      x: positionRef.current.startX - event.clientX,
      y: positionRef.current.startY - event.clientY,
    };
    positionRef.current = { startX: event.clientX, startY: event.clientY };
    onMove?.(distance);
  };

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    setDragging(false);
    props.handleDragEnd?.();
  };

  return (
    <>
      <div className={styles.area} id="yq-area" style={props.style}>
        <div
          className={styles.dargArea}
          onMouseDown={handleDragStart}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
        />
        {props.children}
      </div>
      {dragging && (
        <div
          onMouseMove={handleDrag}
          onMouseUp={handleDragEnd}
          className={styles.dragBarMask}
          onMouseLeave={() => {
            setDragging(false);
            props.handleDragEnd?.();
          }}
        />
      )}
    </>
  );
};

export default React.memo(DragMoveArea);
