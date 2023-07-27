import React from 'react';
import { Avatar, Menu, Popover } from 'antd';
import { images } from '@/assets';
import LinkHelper from '@/core/link-helper';
import { LogoutOutlined } from '@ant-design/icons';
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
  const menu = (
    <>
      <div className={styles.info}>
        <div className={styles.title}>{user.name}</div>
        <div className={styles.login}>
          {user.login}
          <a target="_blank" href={LinkHelper.goMyPage(user)}>
            {__i18n('访问主页')}
          </a>
        </div>
      </div>
      <div className={styles.logout} onClick={onLogout}>
        <LogoutOutlined style={{ marginRight: 8 }} />
        <span>{__i18n('退出账户')}</span>
      </div>
    </>
  );

  return (
    <Popover
      overlayClassName={styles.popover}
      content={menu}
      placement="bottomRight"
      getPopupContainer={node => node.parentElement}
    >
      <div className={styles.wrapper}>
        <Avatar src={user.avatar_url} size={24} />
        <span className={styles.name}>{user.name}</span>
        <img
          className={styles.switch}
          src={images.switchAccount}
        />
      </div>
    </Popover>
  );
};

export default UserInfo;
