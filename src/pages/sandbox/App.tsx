import React, { useState, useContext } from 'react';
import { ConfigProvider, Radio, RadioChangeEvent } from 'antd';
import { CloseOutlined, SettingOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import Chrome from '@/core/chrome';
import { GLOBAL_EVENTS } from '@/events';
import { initI18N } from '@/isomorphic/i18n';
import { AccountContext } from '@/context/account-context';
import AccountLayout from '@/components/sandbox/account-layout';
import { __i18n } from '@/isomorphic/i18n';
import { preferencesUrl } from '@/isomorphic/word-mark';
import eventManager from '@/core/event/eventManager';
import { AppEvents } from '@/core/event/events';
import UserInfo from './UserInfo';
import { EditorValueContext } from './EditorValueContext';
import { Other } from './Other';
import SaveTo from './SaveTo';
import styles from './App.module.less';

initI18N();
type TabName = 'save-to' | 'other';

const onClose = () => {
  Chrome.tabs.getCurrent((tab: any) => {
    Chrome.tabs.sendMessage(tab.id, {
      action: GLOBAL_EVENTS.CLOSE_BOARD,
    });
  });
  eventManager.notify(AppEvents.CLOSE_BOARD);
};

const App = () => {
  const [ editorValue, setEditorValue ] = useState([]);
  const [ currentType, setCurrentType ] = useState(null);
  const accountContext = useContext(AccountContext);
  const [ tab, setTab ] = React.useState<TabName>('save-to');

  const handleTabChange = (e: RadioChangeEvent) => {
    setTab(e.target.value as unknown as TabName);
  };

  return (
    <EditorValueContext.Provider
      value={{ editorValue, currentType, setEditorValue, setCurrentType }}
    >
      <div className={styles.wrapper}>
        <div className={styles.header}>{__i18n('语雀剪藏')}</div>
        <CloseOutlined className={styles.close} onClick={onClose} />
        <div className={styles.items}>
          <Radio.Group
            value={tab}
            onChange={handleTabChange}
            style={{ marginBottom: 16, padding: '0 24px' }}
          >
            <Radio.Button value="save-to">{__i18n('剪藏')}</Radio.Button>
            <Radio.Button value="other">{__i18n('其他')}</Radio.Button>
          </Radio.Group>
          <SaveTo
            className={classnames({
              [styles.hidden]: tab !== 'save-to',
            })}
          />
          <Other
            className={classnames({
              [styles.hidden]: tab !== 'other',
            })}
          />
          <div className={styles.account}>
            <div
              className={styles.settings}
              onClick={() => {
                Chrome.tabs.create({
                  url: preferencesUrl,
                });
              }}
            >
              <SettingOutlined />
              {__i18n('偏好设置')}
            </div>
            <UserInfo
              user={accountContext.user}
              onLogout={accountContext.onLogout}
            />
          </div>
        </div>
      </div>
    </EditorValueContext.Provider>
  );
};

function ContextApp() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00B96B',
        },
      }}
    >
      <AccountLayout close={onClose}>
        <App />
      </AccountLayout>
    </ConfigProvider>
  );
}

export default ContextApp;
