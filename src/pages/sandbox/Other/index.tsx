import * as React from 'react';
import classnames from 'classnames';

import styles from './styles.module.less';

import cloudTip from '@/assets/images/cloud-tip.jpg';
 
interface OtherProps {
  className?: string;
}

export const Other = (props: OtherProps) => {
  return (
    <div className={classnames(styles.other, props.className)}>
      <img width="110" src={cloudTip} />
      <div className={styles.tip}>{__i18n('即将上新')}</div>
    </div>
  );
};
