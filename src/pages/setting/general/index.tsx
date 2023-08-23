import React, { useContext } from 'react';
import { YUQUE_DOMAIN } from '@/config';
import styles from './index.module.less';
import { AccountContext } from '@/context/account-context';

function General() {
  const accountContext = useContext(AccountContext);
  const user = accountContext.user;

  return (
    <div>
      <div className={styles.title}>{__i18n('账户')}</div>
      <div className={styles.card}>
        <img src={user?.avatar_url} className={styles.avatar} />
        <div className={styles.infoWrapper}>
          <div className={styles.name}>{user.name}</div>
        </div>
        <div className={styles.operateWrapper}>
          <div className={styles.operateItem} onClick={accountContext.onLogout}>
            {__i18n('退出登录')}
          </div>
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
