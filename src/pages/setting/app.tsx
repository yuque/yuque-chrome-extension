import React, { useMemo, useState } from 'react';
import classnames from 'classnames';
import { initI18N } from '@/isomorphic/i18n';
import AccountLayout from '@/components/AccountLayout';
import AntdLayout from '@/components/AntdLayout';
import General from './general';
import WordMark from './wordMark';
import About from './about';
import Help from './help';
import Shortcut from './shortcut';
import styles from './app.module.less';
import '@/styles/global.less';

initI18N();

enum Page {
  // 通用设置
  general = 'general',
  // 快捷键设置
  shortcut = 'shortcut',
  // 划词工具栏
  wordMark = 'wordMark',
  // 帮助页面
  help = 'help',
  // 关于页面
  about = 'about',
}

const menus = [
  {
    name: __i18n('通用设置'),
    key: Page.general,
    page: <General />,
  },
  {
    name: __i18n('快捷键设置'),
    key: Page.shortcut,
    page: <Shortcut />,
  },
  {
    name: __i18n('划词工具栏'),
    key: Page.wordMark,
    page: <WordMark />,
  },
  {
    name: __i18n('帮助与反馈'),
    key: Page.help,
    page: <Help />,
  },
  {
    name: __i18n('关于语雀插件'),
    key: Page.about,
    page: <About />,
  },
];

function App() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const queryPage = urlParams.get('page') as Page;
  const defaultPage = Object.values(Page).includes(queryPage)
    ? queryPage
    : Page.general;

  const [page, setPage] = useState<Page>(defaultPage);
  const title = useMemo(() => {
    return menus.find(item => item.key === page)?.name;
  }, [page]);

  return (
    <AntdLayout>
      <AccountLayout>
        <div className={styles.pageWrapper}>
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
            <div className={styles.pageTitle}>{title}</div>
            {menus.map(item => {
              return (
                <div
                  className={classnames({
                    [styles.hidden]: page !== item.key,
                  })}
                  key={item.key}
                >
                  {item.page}
                </div>
              );
            })}
          </div>
        </div>
      </AccountLayout>
    </AntdLayout>
  );
}

export default App;
