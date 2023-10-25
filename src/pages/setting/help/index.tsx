import React from 'react';
import { __i18n } from '@/isomorphic/i18n';
import ArrowDownSvg from '@/assets/svg/arrow-down.svg';
import Icon from '@ant-design/icons/lib/components/Icon';
import LinkHelper from '@/isomorphic/link-helper';
import styles from './index.module.less';

function Help() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.link}>
        <span onClick={() => window.open(LinkHelper.helpDoc)}>
          {__i18n('查看帮助文档')}
        </span>
        <Icon component={ArrowDownSvg} className={styles.icon} />
      </div>
      <div className={styles.link}>
        <span onClick={() => window.open(LinkHelper.feedback)}>
          {__i18n('提交反馈与建议')}
        </span>
        <Icon component={ArrowDownSvg} className={styles.icon} />
      </div>
      <div className={styles.link}>
        <span onClick={() => window.open(LinkHelper.joinGroup)}>
          {__i18n('加入交流群')}
        </span>
        <Icon component={ArrowDownSvg} className={styles.icon} />
      </div>
    </div>
  );
}

export default React.memo(Help);
