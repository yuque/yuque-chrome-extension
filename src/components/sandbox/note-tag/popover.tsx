import React, { useEffect, useRef } from 'react';
import classnames from 'classnames';
import useClickAway from '@/hooks/useClickAway';
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
  const ref = useRef();

  useEffect(() => {
    if (open) {
      renderRef.current = true;
    }
  }, [ open ]);

  useClickAway(ref, () => {
    onOpenChange(false);
  });

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
    <div className={styles.wrapper} ref={ref}>
      {renderPopover()}
      <div>{props.children}</div>
    </div>
  );
}

export default Popover;
