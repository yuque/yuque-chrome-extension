import React from 'react';
import Icon, { CloseOutlined } from '@ant-design/icons';
import { __i18n } from '@/isomorphic/i18n';
import { isRunningInjectPage } from '@/core/uitl';
import LinkHelper from '@/isomorphic/link-helper';
import { backgroundBridge } from '@/core/bridge/background';
import UserAvatar from '@/components/UserAvatar';
import YuqueLogoSvg from '@/assets/svg/yuque-logo.svg';
import SettingSvg from '@/assets/svg/setting.svg';
import HomeSvg from '@/assets/svg/home.svg';
import styles from './index.module.less';

function SuperSidebarHeader() {
  const openHome = () => {
    window.open(LinkHelper.dashboard);
  };
  const openSetting = () => {
    window.open(LinkHelper.settingPage);
  };

  const closeSidePanel = () => {
    backgroundBridge.sidePanel.close();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <Icon component={YuqueLogoSvg} className={styles.yuqueIcon} />
        <span className={styles.title}>{__i18n('语雀·智能笔记')}</span>
      </div>
      <div className={styles.right}>
        <div className={styles.infoWrapper}>
          <div className={styles.itemWrapper} onClick={openHome}>
            <Icon component={HomeSvg} />
          </div>
          <div className={styles.itemWrapper} onClick={openSetting}>
            <Icon component={SettingSvg} />
          </div>
          <UserAvatar />
        </div>
        {isRunningInjectPage && (
          <div onClick={closeSidePanel} className={styles.closeWrapper}>
            <CloseOutlined />
          </div>
        )}
      </div>
    </div>
  );
}

export default SuperSidebarHeader;
