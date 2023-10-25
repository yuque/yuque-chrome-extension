import React from 'react';
import { __i18n } from '@/isomorphic/i18n';
import { RELEASE_NOTES, VERSION } from '@/config';
import LinkHelper from '@/isomorphic/link-helper';
import styles from './index.module.less';

function About() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>{__i18n('更新日志')}</div>
      <div className={styles.version}>v{VERSION}</div>
      {RELEASE_NOTES.map((item, index) => {
        return (
          <div className={styles.item} key={index}>
            <span>{item}</span>
          </div>
        );
      })}
      <a
        href={LinkHelper.changelog}
        target="_blank"
        className={styles.link}
      >
        {__i18n('查看更多')}
      </a>
    </div>
  );
}

export default React.memo(About);
