import React, { useState } from 'react';
import {
  Button,
  List,
  Avatar,
} from 'antd';
import classnames from 'classnames';
import { setCurrentAccount } from '@/core/account';
import FeedBack from './FeedBack';

import type { IYuqueAccount } from './UserInfo';

import YuqueLogo from '@/assets/images/yuque-logo.png';

import styles from './Login.module.less';

const Login = props => {
  const [ loading ] = useState(true);
  const [ accounts ] = useState<IYuqueAccount[]>([]);
  const [ selectedAccount ] = useState<IYuqueAccount>(
    {} as IYuqueAccount,
  );

  const onConfirm = () => {
    setCurrentAccount(selectedAccount).then(() => {
      props.onConfirm(selectedAccount);
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.welcome}>
        <img width="60" src={YuqueLogo} alt="yuque logo" />
        <div className={styles.loginTip}>{__i18n('欢迎，请点击登录语雀账户')}</div>
      </div>
      <List
        className={styles.list}
        loading={loading}
        itemLayout="horizontal"
        dataSource={accounts}
        renderItem={item => (
          <List.Item
            className={classnames({
              selected: item.id === selectedAccount.id,
            })}
          >
            <List.Item.Meta
              avatar={(
                <Avatar
                  src={item.avatar_url}
                  size={36}
                />
              )}
              title={(
                <div className={styles.title}>
                  <span>
                    {item.name}
                  </span>
                  <span className={styles.login}>
                    {item.login}
                  </span>
                </div>
              )}
              description={(
                <span>
                  {item.hostname}
                </span>
              )}
            />
          </List.Item>
        )}
      />
      <Button
        type="primary"
        block
        onClick={onConfirm}
        disabled={false}
      >
        {__i18n('登录验证')}
      </Button>
      <FeedBack className={styles.feedback} />
    </div>
  );
};

export default Login;
