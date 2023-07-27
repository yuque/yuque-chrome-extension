import React from 'react';
import { Avatar, ConfigProvider, Menu, Popover } from 'antd';
import LinkHelper from '@/core/link-helper';
import { DownOutlined } from '@ant-design/icons';
import type { MenuInfo } from 'rc-menu/lib/interface';

import styles from './UserInfo.module.less';

export interface IYuqueAccountError {
  code: number | string;
}

export interface IYuqueAccount {
  id: number;
  login: string;
  name: string;
  avatar_url: string;

  protocol?: string;
  hostname?: string;
  error?: IYuqueAccountError;
}

interface Props {
  user: IYuqueAccount;
  onLogout: () => void;
}

const UserInfo = (props: Props) => {
  const { user, onLogout } = props;
  const handleMenuClick = (info: MenuInfo) => {
    // eslint-disable-next-line default-case
    switch (info.key) {
      case 'user-profile':
        window.open(LinkHelper.goMyPage(user), '_blank');
        break;
      case 'logout':
        onLogout?.();
        break;
      case 'update-version':
        // todo:
        break;
    }
  };

  const menu = (
    <Menu
      mode="inline"
      inlineIndent={8}
      onClick={handleMenuClick}
      items={[
        {
          key: 'user-profile',
          label: __i18n('访问主页'),
        },
        {
          key: 'update-version',
          label: __i18n('升级到新版本'),
        },
        {
          key: 'logout',
          label: __i18n('退出账户'),
        },
      ]}
    />
  );

  const title = (
    <div className={styles.title}>
      <Avatar src={user.avatar_url} size={32} />
      <div className={styles.userInfo}>
        <div className={styles.name}>{user.name}</div>
        <div className={styles.login}>{user.login}</div>
      </div>
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemHeight: 32,
            itemMarginInline: 0,
            itemPaddingInline: 8,
            activeBarBorderWidth: 0,
          },
        },
      }}
    >
      <Popover
        overlayClassName={styles.popover}
        title={title}
        content={menu}
        placement="bottomLeft"
        open
        getPopupContainer={node => node.parentElement}
      >
        <div className={styles.wrapper}>
          <Avatar src={user.avatar_url} size={24} />
          <span className={styles.name}>{user.name}</span>
          <DownOutlined className={styles.switch} />
        </div>
      </Popover>
    </ConfigProvider>
  );
};

export default UserInfo;
