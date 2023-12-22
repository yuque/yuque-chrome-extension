import React, { useMemo, useCallback } from 'react';
import { Avatar, Badge, Popover, Modal } from 'antd';
import LinkHelper from '@/isomorphic/link-helper';
import SemverCompare from 'semver-compare';
import { VERSION } from '@/config';
import { useCheckVersion } from '@/hooks/useCheckVersion';
import { useAccountContext } from '@/components/AccountLayout/useAccountContext';
import { __i18n } from '@/isomorphic/i18n';
import styles from './index.module.less';

const UserAvatar = () => {
  const { user, onLogout } = useAccountContext();

  const newVersion = useCheckVersion();
  const needUpgrade = React.useMemo(() => {
    return SemverCompare(newVersion || '', VERSION) === 1;
  }, [newVersion]);

  const [open, setOpen] = React.useState(false);

  const handleOpenChange = (visible: boolean) => {
    setOpen(visible);
  };

  const handleMenuClick = useCallback((key: string) => {
    // eslint-disable-next-line default-case
    switch (key) {
      case 'user-profile':
        window.open(LinkHelper.dashboard, '_blank');
        break;
      case 'logout':
        onLogout?.();
        break;
      case 'feedback':
        window.open(LinkHelper.feedback(), '_blank');
        break;
      case 'useHelp': {
        window.open(LinkHelper.helpDoc, '_blank');
        break;
      }
      case 'upgrade-version':
        Modal.confirm({
          content: (
            <iframe
              src={LinkHelper.updateIframe}
              className={styles.updateIframe}
            />
          ),
          width: 920,
          footer: null,
          maskClosable: true,
          wrapClassName: styles.updateModal,
        });
        break;
    }
    setOpen(false);
  }, []);

  const content = useMemo(() => {
    const menuItems = [
      {
        key: 'user-profile',
        label: __i18n('打开语雀'),
      },
      {
        key: 'upgrade-version',
        label: (
          <div className={styles.upgradeVersionItem}>
            <span className={styles.name}>
              {__i18n('升级新版本')}
              <Badge
                style={{ marginLeft: 4 }}
                status="processing"
                color="blue"
              />
            </span>
            <span className={styles.version}>&nbsp;v{newVersion}</span>
          </div>
        ),
      },
      {
        key: 'useHelp',
        label: __i18n('使用帮助'),
      },
      {
        key: 'feedback',
        label: __i18n('问题反馈'),
      },
      {
        key: 'logout',
        label: __i18n('退出账户'),
      },
    ].filter(n => {
      if (n.key === 'upgrade-version') {
        return needUpgrade;
      }
      return true;
    });
    return (
      <div className={styles.userInfoWrapper}>
        <div className={styles.title}>
          <Avatar src={user.avatar_url} size={32} />
          <div className={styles.userInfo}>
            <div className={styles.name}>{user.name}</div>
            <div className={styles.login}>{user.login}</div>
          </div>
        </div>
        <div className={styles.menuWrapper}>
          {menuItems.map((item, index) => {
            return (
              <div
                className={styles.menuItem}
                key={index}
                onClick={() => handleMenuClick(item.key)}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [user, needUpgrade, handleMenuClick]);

  return (
    <Popover
      content={content}
      placement="bottomLeft"
      open={open}
      onOpenChange={handleOpenChange}
      getPopupContainer={node => node.parentElement as HTMLElement}
      destroyTooltipOnHide
    >
      <Badge
        size="default"
        dot={needUpgrade}
        color="blue"
        className={styles.wrapper}
      >
        <Avatar src={user.avatar_url} size={16} />
      </Badge>
    </Popover>
  );
};

export default UserAvatar;
