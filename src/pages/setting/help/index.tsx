import React from 'react';
import { __i18n } from '@/isomorphic/i18n';
import LinkHelper from '@/core/link-helper';
import styles from './index.module.less';

const links = [
  {
    url: LinkHelper.helpDoc,
    title: __i18n('查看帮助文档'),
  },
  {
    url: LinkHelper.feedback,
    title: __i18n('提交反馈与建议'),
  },
  {
    url: LinkHelper.joinGroup,
    title: __i18n('加入交流群'),
  },
];

function Help() {
  return (
    <div className={styles.wrapper}>
      {links.map((item, index) => {
        return (
          <div key={index} className={styles.item}>
            <span onClick={() => window.open(item.url)}>{item.title}</span>
          </div>
        );
      })}
    </div>
  );
}

export default React.memo(Help);
