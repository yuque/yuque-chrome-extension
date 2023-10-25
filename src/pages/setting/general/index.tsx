import React from 'react';
import { Button } from 'antd';
import Icon from '@ant-design/icons';
import LinkHelper from '@/isomorphic/link-helper';
import { useAccountContext } from '@/components/AccountLayout/useAccountContext';
import HomeSvg from '@/assets/svg/home.svg';
import styles from './index.module.less';

function General() {
  const { user, onLogout } = useAccountContext();

  const openHome = () => {
    window.open(LinkHelper.dashboard);
  };

  return (
    <div>
      <div className={styles.title}>{__i18n('账户')}</div>
      <div className={styles.card}>
        <img src={user?.avatar_url} className={styles.avatar} />
        <div className={styles.infoWrapper}>
          <div className={styles.name}>{user.name}</div>
          <Icon
            component={HomeSvg}
            className={styles.homeIcon}
            onClick={openHome}
          />
        </div>
        <div className={styles.operateWrapper}>
          <Button onClick={onLogout} className={styles.button}>
            {__i18n('退出登录')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(General);
