import React from 'react';
import classnames from 'classnames';
import { Spin } from 'antd';
import { IMessageProgress, IRenderProgressOptions } from '../../declare';
import { CONVERSATION_STEP_TYPE_STATUS } from '@/isomorphic/constant/ai';
import LarkIcon from '@/components/LarkIcon';
import Typography from '@/components/Typography';
import styles from './index.module.less';

type Props = IRenderProgressOptions;

export const MessageProgress = (props: Props) => {
  const { className, style, progresses } = props;
  if (!progresses?.length) {
    return null;
  }

  return (
    <div
      className={classnames(styles.progressContainer, className)}
      style={style}
    >
      {progresses.map((item: IMessageProgress, index: number) => {
        const { status, icon, text } = item;

        let realIcon = icon;
        if (!realIcon) {
          if (status === CONVERSATION_STEP_TYPE_STATUS.SUCCESS) {
            realIcon = (
              <LarkIcon
                className={styles.icon}
                size={16}
                name={'check' as any}
              />
            );
          } else if (status === CONVERSATION_STEP_TYPE_STATUS.FAILED) {
            realIcon = (
              <LarkIcon
                className={styles.icon}
                size={16}
                name={'exclamationcircle' as any}
              />
            );
          } else if (status === CONVERSATION_STEP_TYPE_STATUS.PENDING) {
            realIcon = (
              <Spin
                size="small"
                indicator={
                  <LarkIcon size={16} name="icon-loading-green" spin />
                }
                className={styles.icon}
              />
            );
          }
        }

        return (
          <div className={styles.item} key={index}>
            {realIcon}
            <Typography ml={8} variant="caption" fontSize={12}>
              {text}
            </Typography>
          </div>
        );
      })}
    </div>
  );
};
