import React, { useEffect, useState } from 'react';
import { Tooltip } from 'antd';
import { STORAGE_KEYS } from '@/config';
import { __i18n } from '@/isomorphic/i18n';
import LinkHelper from '@/isomorphic/link-helper';
import Env from '@/isomorphic/env';
import { backgroundBridge } from '@/core/bridge/background';
import LarkIcon from '@/components/LarkIcon';
import UserAvatar from '@/components/UserAvatar';
import { storage } from '@/isomorphic/storage';
import styles from './index.module.less';

function SuperSidebarHeader() {
  const [showTip, setShowTip] = useState(false);
  const openHome = () => {
    window.open(LinkHelper.dashboard);
  };

  const hiddenTip = () => {
    storage.update(STORAGE_KEYS.TIP.READ_SHORTCUT, true);
    setShowTip(false);
  };

  const openSetting = () => {
    if (showTip) {
      window.open(LinkHelper.shortcutSettingPage);
      hiddenTip();
      return;
    }
    window.open(LinkHelper.settingPage);
  };

  const closeSidePanel = () => {
    backgroundBridge.sidePanel.close();
  };

  useEffect(() => {
    storage.get(STORAGE_KEYS.TIP.READ_SHORTCUT).then(res => {
      if (!res) {
        setShowTip(true);
      }
    });
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <LarkIcon className={styles.yuqueIcon} name={'yuque-logo'} />
        <span className={styles.title}>{Env.isBate ? __i18n('语雀 Beta') : __i18n('语雀')}</span>
      </div>
      <div className={styles.right}>
        <div className={styles.infoWrapper}>
          <Tooltip title={__i18n('访问语雀')}>
            <div className={styles.itemWrapper} onClick={openHome}>
              <LarkIcon name="home" />
            </div>
          </Tooltip>
          <Tooltip
            title={
              <span>
                {__i18n('立即设置快捷键，为操作提效')}
                <LarkIcon name="close-outline" className={styles.closeTip} onClick={hiddenTip} />
              </span>
            }
            placement="bottomRight"
            open={showTip}
            overlayClassName={styles.tooltipWrapper}
            getPopupContainer={node => node.parentElement as HTMLElement}
            arrow={{ pointAtCenter: true }}
          >
            {showTip ? (
              <div className={styles.itemWrapper} onClick={openSetting}>
                <LarkIcon name="setting" />
              </div>
            ) : (
              <Tooltip title={__i18n('设置')}>
                <div className={styles.itemWrapper} onClick={openSetting}>
                  <LarkIcon name="setting" />
                </div>
              </Tooltip>
            )}
          </Tooltip>
          <div className={styles.itemWrapper}>
            <UserAvatar />
          </div>
        </div>
        {Env.isRunningHostPage && (
          <div onClick={closeSidePanel} className={styles.closeWrapper}>
            <LarkIcon name="close-outline" />
          </div>
        )}
      </div>
    </div>
  );
}

export default SuperSidebarHeader;
