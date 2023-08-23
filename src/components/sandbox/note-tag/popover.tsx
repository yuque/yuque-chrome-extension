import React, { useEffect, useRef } from 'react';
import classnames from 'classnames';
import styles from './popover.module.less';

interface IPopoverProps {
  children?: React.ReactElement;
  content: React.ReactElement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Popover(props: IPopoverProps) {
  const { content, open, onOpenChange } = props;
  const renderRef = useRef(open);

  useEffect(() => {
    if (open) {
      renderRef.current = true;
    }
  }, [ open ]);

  const renderPopover = () => {
    return (
      <div
        className={classnames(styles.popoverWrapper, {
          [styles.visibleWrapper]: open,
        })}
      >
        {!renderRef.current && !open ? null : content}
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      {renderPopover()}
      <div onClick={() => onOpenChange(!open)}>{props.children}</div>
    </div>
  );
}

export default Popover;
