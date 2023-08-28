import React, { useContext } from 'react';
import { Radio } from 'antd';
import Icon, { SettingOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { AccountContext } from '@/context/account-context';
import { __i18n } from '@/isomorphic/i18n';
import { preferencesUrl } from '@/isomorphic/word-mark';
import UserInfo from '@/components/user-info';
import CloseSvg from '@/assets/svg/close.svg';
import { InjectAppContext } from '@/context/inject-app-context';
import SaveTo from './SaveTo';
import { Other } from './Other';
import styles from './index.module.less';

enum TabName {
  saveTo = 'saveTo',

  other = 'other',
}

function Clipping() {
  const { updateInjectAppType, editorRef } = useContext(InjectAppContext);
  const { user, onLogout } = useContext(AccountContext);
  const [ tab, setTab ] = React.useState<TabName>(TabName.saveTo);

  const onClose = () => {
    updateInjectAppType(null);
    editorRef.current.hiddenIframe();
  };

  return (
    <div className={styles.clippingPanel}>
      <div className={styles.panelTitle}>{__i18n('语雀剪藏')}</div>
      <div className={styles.body}>
        <Radio.Group
          value={tab}
          onChange={e => setTab(e.target.value)}
          className={styles.radioGroup}
        >
          <Radio.Button value={TabName.saveTo}>{__i18n('剪藏')}</Radio.Button>
          <Radio.Button value={TabName.other}>{__i18n('其他')}</Radio.Button>
        </Radio.Group>

        <SaveTo
          className={classnames({
            hidden: tab !== TabName.saveTo,
          })}
        />
        <Other
          className={classnames({
            hidden: tab !== TabName.other,
          })}
        />
      </div>
      <div className={styles.footer}>
        <div
          className={styles.settingWrapper}
          onClick={() => {
            window.open(preferencesUrl, '_blank');
          }}
        >
          <SettingOutlined />
          {__i18n('偏好设置')}
        </div>
        <div className={styles.settings}></div>
        <UserInfo user={user} onLogout={onLogout} />
      </div>
      <Icon
        component={CloseSvg}
        className={styles.closeWrapper}
        onClick={onClose}
      />
    </div>
  );
}

export default Clipping;
