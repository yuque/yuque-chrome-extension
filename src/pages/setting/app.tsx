import React, { useMemo, useState } from 'react';
import { ConfigProvider } from 'antd';
import classnames from 'classnames';
import { initI18N } from '@/isomorphic/i18n';
import AccountLayout from '@/components/sandbox/account-layout';
import General from './general';
import WordMark from './word-mark';
import styles from './app.module.less';

initI18N();

enum Page {
  // 通用设置
  general = 'general',
  // 划词快捷指令
  wordMark = 'wordMark',
}

const menus = [
  {
    name: __i18n('通用设置'),
    key: Page.general,
  },
  {
    name: __i18n('划词快捷指令'),
    key: Page.wordMark,
  },
];

function App() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const queryPage = urlParams.get('page') as Page;
  const defaultPage = Object.values(Page).includes(queryPage)
    ? queryPage
    : Page.general;

  const [ page, setPage ] = useState<Page>(defaultPage);
  const title = useMemo(() => {
    return menus.find(item => item.key === page).name;
  }, [ page ]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00B96B',
        },
      }}
    >
      <AccountLayout position="center">
        <div className={styles.pageWrapper}>
          <div className={styles.page}>
            <div className={styles.left}>
              <div className={styles.header}>{__i18n('语雀浏览器插件')}</div>
              <div className={styles.menu}>
                {menus.map(item => {
                  return (
                    <div
                      className={classnames(styles.menuItem, {
                        [styles.menuItemSelect]: page === item.key,
                      })}
                      onClick={() => setPage(item.key)}
                      key={item.key}
                    >
                      {item.name}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.title}>{title}</div>
              <div
                className={classnames({
                  [styles.hidden]: page !== Page.general,
                })}
              >
                <General />
              </div>
              <div
                className={classnames({
                  [styles.hidden]: page !== Page.wordMark,
                })}
              >
                <WordMark />
              </div>
            </div>
          </div>
        </div>
      </AccountLayout>
    </ConfigProvider>
  );
}

export default App;
