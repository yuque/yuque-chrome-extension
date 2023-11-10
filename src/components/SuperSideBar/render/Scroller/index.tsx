import React, { useRef } from 'react';
import classnames from 'classnames';
import { IRenderScrollerOptions, IScrollerRef } from '../../declare';
import styles from './index.module.less';

type Props = IRenderScrollerOptions;

const ScrollerImpl = (props: Props, ref: any) => {
  const { className, children, ...rest } = props;
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (immediately = false) => {
    if (immediately) {
      containerRef.current?.scroll({
        left: 0,
        top: containerRef.current.scrollHeight,
      });
      return;
    }
    setTimeout(() => {
      containerRef.current?.scroll({
        left: 0,
        top: containerRef.current.scrollHeight,
        behavior: !immediately ? 'smooth' : 'auto',
      });
    }, 300);
  };

  React.useImperativeHandle(
    ref,
    (): IScrollerRef => ({
      scrollToBottom,
    }),
  );

  return (
    <div
      className={classnames(styles.scroller, className)}
      {...rest}
      ref={containerRef}
    >
      {children}
    </div>
  );
};

export const Scroller = React.forwardRef(ScrollerImpl);
