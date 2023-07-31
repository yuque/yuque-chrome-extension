import React from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { pkg, VERSION } from '@/config';

import styles from './FeedBack.module.less';

const FeedBack: React.FC<React.HTMLAttributes<HTMLAnchorElement>> = props => (
  <a
    className={classnames(styles.wrapper, props.className)}
    target="_blank"
    rel="noopener noreferrer"
    href={pkg.issues}
  >
    <QuestionCircleOutlined className={styles.icon} />
    {__i18n('问题反馈')}&nbsp;v{VERSION}
  </a>
);

export default FeedBack;
