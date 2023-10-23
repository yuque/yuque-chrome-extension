import React from 'react';
import { __i18n } from '@/isomorphic/i18n';
import LinkHelper from '@/core/link-helper';
import styles from './index.module.less';

function Help() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.link}>
        <span onClick={() => window.open(LinkHelper.helpDoc)}>
          {__i18n('查看帮助文档')}
        </span>
      </div>
      <div className={styles.link}>
        <span onClick={() => window.open(LinkHelper.feedback)}>
          {__i18n('提交反馈与建议')}
        </span>
      </div>
      <div className={styles.line} />
      <div className={styles.joinUs}>
        <div className={styles.title}>{__i18n('加入交流群')}</div>
        <img className={styles.img} src="https://cdn.nlark.com/yuque/0/2023/png/29457262/1695715698905-e0243127-c4ab-4ad0-9e60-78866a6d83dc.png?x-oss-process=image%2Fresize%2Cw_548%2Climit_0" />
      </div>
    </div>
  );
}

export default React.memo(Help);
