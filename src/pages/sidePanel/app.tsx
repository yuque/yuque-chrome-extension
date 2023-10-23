import React from 'react';
import AccountLayout from '@/components/AccountLayout';
import SuperSideBarContainer from '@/components/SuperSideBar/container';
import AntdLayout from '@/components/AntdLayout';
import styles from './app.module.less';
import '@/styles/global.less';

function App() {
  return (
    <AntdLayout>
      <div className={styles.appWrapper}>
        <div className={styles.sidePanelWrapper}>
          <AccountLayout>
            <SuperSideBarContainer />
          </AccountLayout>
        </div>
      </div>
    </AntdLayout>
  );
}

export default App;
