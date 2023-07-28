import React from 'react';
import { Avatar, Badge, ConfigProvider, Menu, Popover } from 'antd';
import LinkHelper from '@/core/link-helper';
import { DownOutlined } from '@ant-design/icons';
import type { MenuInfo } from 'rc-menu/lib/interface';
import SemverCompare from 'semver-compare';
import { VERSION } from '@/config';
import { useCheckVersion } from './CheckVersion';

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
      case 'upgrade-version':
        window.open('https://www.yuque.com/yuque/yuque-browser-extension/welcome#G8HaG', '_blank');
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
        label: (<span>
          {__i18n('升级新版本')}
          &nbsp;v{newVersion}
          <Badge style={{ marginLeft: 4 }} status="processing" />
        </span>
        ),
      },
      {
        key: 'current-version',
        label: (<span>
          {__i18n('当前版本')}
          &nbsp;v{VERSION}
        </span>
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
      if (n.key === 'current-version') {
        return !needUpgrade;
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
