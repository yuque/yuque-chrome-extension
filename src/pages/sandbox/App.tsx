import React, { useState, useEffect, useContext } from 'react';
import { ConfigProvider, Radio, RadioChangeEvent } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import Chrome from '@/core/chrome';
import { GLOBAL_EVENTS } from '@/events';
import { initI18N } from '@/isomorphic/i18n';
import { ActionListener } from '@/core/action-listener';
import { SELECT_TYPE_SELECTION } from './constants/select-types';
import { AccountContext } from '@/context/account-context';
import AccountLayout from '@/components/sandbox/account-layout';
import FeedBack from '@/components/sandbox/feedback';
import UserInfo from './UserInfo';
import { EditorValueContext } from './EditorValueContext';
import { Other } from './Other';
import SaveTo from './SaveTo';
import styles from './App.module.less';

initI18N();
type TabName = 'save-to' | 'other';

const App = () => {
  const [ editorValue, setEditorValue ] = useState([]);
  const [ currentType, setCurrentType ] = useState(ActionListener.currentType);
  const accountContext = useContext(AccountContext);

  const onClose = () => {
    Chrome.tabs.getCurrent((tab: any) => {
      Chrome.tabs.sendMessage(tab.id, {
        action: GLOBAL_EVENTS.CLOSE_BOARD,
      });
    });
  };

  const [ tab, setTab ] = React.useState<TabName>('save-to');

  const handleTabChange = (e: RadioChangeEvent) => {
    setTab(e.target.value as unknown as TabName);
  };

  useEffect(() => {
    if (currentType === null && ActionListener.currentType) {
      setCurrentType(ActionListener.currentType);
    }
    return ActionListener.addListener(request => {
      if (
        currentType === null &&
        request.action === GLOBAL_EVENTS.GET_SELECTED_TEXT
      ) {
        setCurrentType(SELECT_TYPE_SELECTION);
      }
    });
  }, []);

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
            style={{ marginBottom: 16 }}
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
        </div>
        <div className={styles.account}>
          <FeedBack showVersion={false} />
          <UserInfo
            user={accountContext.user}
            onLogout={accountContext.onLogout}
          />
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
      <AccountLayout>
        <App />
      </AccountLayout>
    </ConfigProvider>
  );
}

export default ContextApp;
