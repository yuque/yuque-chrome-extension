import React from 'react';
import { __i18n } from '@/isomorphic/i18n';
import styles from './index.module.less';

const links = [
  {
    url: 'https://www.yuque.com/yuque/yuque-browser-extension/welcome',
    title: __i18n('查看帮助文档'),
  },
  {
    url: 'https://www.yuque.com/feedbacks/list',
    title: __i18n('提交反馈与建议'),
  },
  {
    url: 'https://www.yuque.com/yuque/yuque-browser-extension/welcome#BQrrd',
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
