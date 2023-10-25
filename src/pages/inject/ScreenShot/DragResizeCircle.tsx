import React, { useState } from 'react';
import classnames from 'classnames';
import styles from './DragResizeCircle.module.less';

export type DragResizeCircleDirection =
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'leftCenter'
  | 'rightCenter'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight';

interface IDragResizeCircleProps {
  direction: DragResizeCircleDirection;
  updatePosition: (
    event: React.DragEvent<HTMLDivElement>,
    resetPosition?: boolean,
  ) => void;
  handleDragEnd: () => void;
}

const DragResizeCircle = (props: IDragResizeCircleProps) => {
  const { direction, updatePosition } = props;
  const [dragging, setDragging] = useState(false);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    setDragging(true);
  };

  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    if (!dragging || !event.clientX || !event.clientY) return;
    updatePosition(event, false);
  };

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    setDragging(false);
    updatePosition(event, true);
    props.handleDragEnd?.();
  };

  return (
    <>
      <div
        className={classnames(styles[`${direction}Circle`], styles.circle)}
        onMouseDown={handleDragStart}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      />
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

export default React.memo(DragResizeCircle);
