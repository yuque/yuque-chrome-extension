import React from 'react';
import { __i18n } from '@/isomorphic/i18n';
import { RELEASE_NOTES, VERSION } from '@/config';
import styles from './index.module.less';

function About() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>{__i18n('更新日志')}</div>
      <div className={styles.version}>v{VERSION}</div>
      {RELEASE_NOTES.map(item => {
        return (
          <div className={styles.item}>
            <span>{item}</span>
          </div>
        );
      })}
      <a
        href="https://www.yuque.com/yuque/yuque-browser-extension/changelog"
        target="_blank"
        className={styles.link}
      >
        {__i18n('查看更多')}
      </a>
    </div>
  );
}

export default React.memo(About);
