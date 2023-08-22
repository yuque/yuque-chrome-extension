import React, { useEffect, useState } from 'react';
import { IUser, getCurrentAccount } from '@/core/account';
import { YUQUE_DOMAIN } from '@/config';
import styles from './index.module.less';

function General() {
  const [ user, setUser ] = useState<IUser>();
  useEffect(() => {
    getCurrentAccount().then(res => {
      setUser(res);
    });
  }, []);

  return (
    <div>
      <div className={styles.title}>{__i18n('账户')}</div>
      <div className={styles.card}>
        <img src={user?.avatar_url} className={styles.avatar} />
        <div className={styles.infoWrapper}>
          <div className={styles.name}>{user?.name}</div>
        </div>
        <div className={styles.operateWrapper}>
          <div className={styles.operateItem}>{__i18n('退出登录')}</div>
          <div
            className={styles.operateItem}
            onClick={() => window.open(YUQUE_DOMAIN)}
          >
            {__i18n('打开语雀')}
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(General);
