import React, { useState } from 'react';
import {
  Button,
  List,
  Avatar,
} from 'antd';
import classnames from 'classnames';
import { setCurrentAccount } from '@/core/account';
import FeedBack from './FeedBack';
import styles from './Login.module.less';
import { IYuqueAccount } from './UserInfo';

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
        {__i18n('欢迎，请点击登录语雀账户')}
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
        className={styles.button}
        type="primary"
        block
        onClick={onConfirm}
        disabled={false}
      >
        {__i18n('登录验证')}
      </Button>
      <div className={styles.feedback}>
        <FeedBack />
      </div>
    </div>
  );
};

export default Login;
