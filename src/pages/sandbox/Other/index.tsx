import * as React from 'react';

import styles from './styles.module.less';

import cloudTip from '@/assets/images/cloud-tip.jpg';

export const Other: React.FC = () => {
  return (
    <div className={styles.other}>
      <img width="110" src={cloudTip} />
      <div className={styles.tip}>{__i18n('即将上新')}</div>
    </div>
  );
};
