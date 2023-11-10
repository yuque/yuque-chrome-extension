import React from 'react';
import classnames from 'classnames';
import { IRenderFrameOptions } from '@/components/SuperSideBar/declare';
import styles from './index.module.less';

type Props = IRenderFrameOptions;

export const MessageFrame = (props: Props) => {
  const { children, fromUser, bottomExtra, className, ...rest } = props;

  return (
    <div className={classnames(styles.messageFrame, className)} {...rest}>
      <div
        className={styles.contentWrapper}
        style={{ alignSelf: fromUser ? 'flex-end' : 'flex-start' }}
      >
        <div className={fromUser ? styles.userContent : styles.answerContent}>
          {children}
        </div>
        {bottomExtra}
      </div>
    </div>
  );
};
