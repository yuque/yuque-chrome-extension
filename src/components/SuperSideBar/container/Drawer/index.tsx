import React, { forwardRef, useImperativeHandle, useState } from 'react';
import classnames from 'classnames';
import { useSpring, animated } from '@react-spring/web';
import Typography from '@/components/Typography';
import LarkIcon from '@/components/LarkIcon';
import { IRootDrawerRef, RootRenderProps } from '../../declare';
import styles from './index.module.less';

export const RootDrawer = forwardRef((_props, ref) => {
  const [conf, setConf] = useState<RootRenderProps>({} as any);
  const [visible, setVisible] = useState(false);
  const style = useSpring({
    translateY: visible ? '0' : '100%',
    config: { duration: 170 },
  });
  const overlayStyle = useSpring({
    opacity: visible ? 1 : 0,
    config: { duration: 170 },
  });
  const onClose = () => {
    setVisible(false);
  };

  useImperativeHandle(
    ref,
    () => {
      return {
        render: (_conf: RootRenderProps) => {
          setConf(_conf);
          setVisible(true);
        },
        onClose,
      } as IRootDrawerRef;
    },
    [],
  );

  return (
    <>
      <animated.div
        hidden={!visible}
        className={styles.overlay}
        style={overlayStyle}
        onClick={onClose}
      />
      <animated.div className={classnames(styles.container)} style={style}>
        <div className={styles.header}>
          <Typography variant="title">{conf.title}</Typography>
          <Typography type="iconButton" color="yuque-grey-9" onClick={onClose}>
            <LarkIcon name="arrow-down" />
          </Typography>
        </div>
        <div className={styles.body}>{conf.content}</div>
      </animated.div>
    </>
  );
});
