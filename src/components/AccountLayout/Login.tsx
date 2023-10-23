import React from 'react';
import { Button, message } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { backgroundBridge } from '@/core/bridge/background';
import { IUser } from '@/isomorphic/interface';
import { __i18n } from '@/isomorphic/i18n';
import LinkHelper from '@/core/link-helper';
import { VERSION } from '@/config';
import YuqueLogo from '@/assets/images/yuque-logo.png';
import styles from './Login.module.less';

interface ILoginProps {
  onLoginSuccess: (user: IUser) => void;
  forceUpgradeHtml?: string;
}

function Login(props: ILoginProps) {
  const { onLoginSuccess, forceUpgradeHtml } = props;

  const onLogin = async () => {
    const user = await backgroundBridge.user.login();
    if (!user) {
      message.error(__i18n('登录失败'));
      return;
    }
    onLoginSuccess(user);
  };

  if (forceUpgradeHtml) {
    return (
      <div className={styles.wrapper}>
        <div
          dangerouslySetInnerHTML={{ __html: forceUpgradeHtml }}
          className={styles.content}
        />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.welcome}>
          <img width="60" src={YuqueLogo} alt="yuque logo" />
          <div className={styles.loginTip}>
            {__i18n('欢迎，请点击登录语雀账户')}
          </div>
        </div>
        <Button type="primary" block onClick={onLogin} disabled={false}>
          {__i18n('立即登录')}
        </Button>
        <a
          className={styles.question}
          target="_blank"
          rel="noopener noreferrer"
          href={LinkHelper.helpDoc}
        >
          <QuestionCircleOutlined className={styles.icon} />
          {__i18n('问题反馈')}
          {`v${VERSION}`}
        </a>
      </div>
    </div>
  );
}

export default React.memo(Login);