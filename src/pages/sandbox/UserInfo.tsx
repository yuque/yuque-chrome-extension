import React from 'react';
import { Avatar, Badge, ConfigProvider, Menu, Popover, Modal } from 'antd';
import LinkHelper from '@/core/link-helper';
import { DownOutlined } from '@ant-design/icons';
import type { MenuInfo } from 'rc-menu/lib/interface';
import SemverCompare from 'semver-compare';
import { VERSION, pkg } from '@/config';
import { useCheckVersion } from './CheckVersion';
import { IUser } from '@/core/account';

import styles from './UserInfo.module.less';

interface Props {
  user: IUser;
  onLogout: () => void;
}

const UserInfo = (props: Props) => {
  const { user, onLogout } = props;

  const newVersion = useCheckVersion();
  const needUpgrade = React.useMemo(() => {
    return SemverCompare(newVersion || '', VERSION) === 1;
  }, [ newVersion ]);

  const [ open, setOpen ] = React.useState(false);

  const handleOpenChange = (visible: boolean) => {
    setOpen(visible);
  };

  const handleMenuClick = (info: MenuInfo) => {
    // eslint-disable-next-line default-case
    switch (info.key) {
      case 'user-profile':
        window.open(LinkHelper.goMyPage(user), '_blank');
        break;
      case 'logout':
        onLogout?.();
        break;
      case 'feedback':
        window.open(pkg.issues, '_blank');
        break;
      case 'upgrade-version':
        Modal.confirm({
          content: (
            <iframe
              src="https://www.yuque.com/yuque/yuque-browser-extension/install?view=doc_embed"
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
  };

  const title = (
    <div className={styles.title}>
      <Avatar src={user.avatar_url} size={32} />
      <div className={styles.userInfo}>
        <div className={styles.name}>{user.name}</div>
        <div className={styles.login}>{user.login}</div>
      </div>
    </div>
  );

  const menuItems = React.useMemo(() => {
    return [
      {
        key: 'user-profile',
        label: __i18n('访问主页'),
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
        key: 'logout',
        label: __i18n('退出账户'),
      },
    ].filter(n => {
      if (n.key === 'upgrade-version') {
        return needUpgrade;
      }
      return true;
    });
  }, [ needUpgrade ]);

  const content = (
    <Menu
      mode="inline"
      inlineIndent={8}
      onClick={handleMenuClick}
      items={menuItems}
    />
  );

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemHeight: 32,
            itemMarginInline: 0,
            itemPaddingInline: 0,
            activeBarBorderWidth: 0,
          },
        },
      }}
    >
      <Popover
        overlayClassName={styles.popover}
        title={title}
        content={content}
        placement="bottomLeft"
        open={open}
        onOpenChange={handleOpenChange}
        getPopupContainer={node => node.parentElement}
        destroyTooltipOnHide
      >
        <div className={styles.wrapper}>
          <Badge size="default" dot={needUpgrade} color="blue">
            <Avatar src={user.avatar_url} size={24} />
          </Badge>
          <span className={styles.name}>{user.name}</span>
          <DownOutlined className={styles.switch} />
        </div>
      </Popover>
    </ConfigProvider>
  );
};

export default UserInfo;
