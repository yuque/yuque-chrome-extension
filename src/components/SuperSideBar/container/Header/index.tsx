import React, { useEffect, useState } from 'react';
import Icon, { CloseOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { STORAGE_KEYS } from '@/config';
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
  const [showTip, setShowTip] = useState(false);
  const openHome = () => {
    window.open(LinkHelper.dashboard);
  };

  const hiddenTip = () => {
    backgroundBridge.storage.update(STORAGE_KEYS.TIP.READ_SHORTCUT, true);
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
    backgroundBridge.storage.get(STORAGE_KEYS.TIP.READ_SHORTCUT).then(res => {
      if (!res) {
        setShowTip(true);
      }
    });
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <Icon component={YuqueLogoSvg} className={styles.yuqueIcon} />
        <span className={styles.title}>{__i18n('语雀')}</span>
      </div>
      <div className={styles.right}>
        <div className={styles.infoWrapper}>
          <Tooltip title={__i18n('访问语雀')} mouseEnterDelay={0.5}>
            <div className={styles.itemWrapper} onClick={openHome}>
              <Icon component={HomeSvg} />
            </div>
          </Tooltip>
          <Tooltip
            title={
              <span>
                {__i18n('立即设置快捷键，为操作提效')}
                <CloseOutlined
                  className={styles.closeTip}
                  onClick={hiddenTip}
                />
              </span>
            }
            placement="bottomRight"
            open={showTip}
            overlayClassName={styles.tooltipWrapper}
            getPopupContainer={node => node as HTMLElement}
            arrow={{ pointAtCenter: true }}
          >
            {showTip ? (
              <div className={styles.itemWrapper} onClick={openSetting}>
                <Icon component={SettingSvg} />
              </div>
            ) : (
              <Tooltip title={__i18n('设置')} mouseEnterDelay={0.5}>
                <div className={styles.itemWrapper} onClick={openSetting}>
                  <Icon component={SettingSvg} />
                </div>
              </Tooltip>
            )}
          </Tooltip>
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
