import React from 'react';
import classnames from 'classnames';
import { IMessageProgress, IRenderProgressOptions } from '../../declare';
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
        const { icon, text } = item;

        const realIcon = icon;

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
