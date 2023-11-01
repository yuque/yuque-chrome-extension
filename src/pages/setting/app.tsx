import React from 'react';
import { Anchor } from 'antd';
import { initI18N } from '@/isomorphic/i18n';
import AccountLayout from '@/components/AccountLayout';
import AntdLayout from '@/components/AntdLayout';
import General from './general';
import WordMark from './wordMark';
import About from './about';
import Help from './help';
import Shortcut from './shortcut';
import styles from './app.module.less';
import SidePanel from './sidePanel';
import '@/styles/global.less';

initI18N();

enum Page {
  // 通用设置
  general = 'general',
  // 快捷键设置
  shortcut = 'shortcut',
  // 侧边栏
  sidePanel = 'sidePanel',
  // 划词工具栏
  wordMark = 'wordMark',
  // 帮助页面
  help = 'help',
  // 关于页面
  about = 'about',
}

const anchorMenus = [
  {
    title: __i18n('通用设置'),
    key: Page.general,
    href: `#${Page.general}`,
  },
  {
    title: __i18n('快捷键设置'),
    key: Page.shortcut,
    href: `#${Page.shortcut}`,
  },
  {
    title: __i18n('侧边栏'),
    key: Page.sidePanel,
    href: `#${Page.sidePanel}`,
  },
  {
    title: __i18n('划词工具栏'),
    key: Page.wordMark,
    href: `#${Page.wordMark}`,
  },
  {
    title: __i18n('帮助与反馈'),
    key: Page.help,
    href: `#${Page.help}`,
  },
  {
    title: __i18n('关于语雀插件'),
    key: Page.about,
    href: `#${Page.about}`,
  },
];

function App() {
  return (
    <AntdLayout>
      <AccountLayout>
        <div className={styles.pageWrapper}>
          <div className={styles.left}>
            <div className={styles.header}>{__i18n('语雀浏览器插件')}</div>
            <Anchor items={anchorMenus} />
          </div>
          <div className={styles.right}>
            <div id={Page.general} className={styles.pageItem}>
              <div className={styles.pageTitle}>{__i18n('通用设置')}</div>
              <General />
            </div>
            <div id={Page.shortcut} className={styles.pageItem}>
              <div className={styles.pageTitle}>{__i18n('快捷键设置')}</div>
              <Shortcut />
            </div>
            <div id={Page.sidePanel} className={styles.pageItem}>
              <div className={styles.pageTitle}>{__i18n('侧边栏')}</div>
              <SidePanel />
            </div>
            <div id={Page.wordMark} className={styles.pageItem}>
              <div className={styles.pageTitle}>{__i18n('划词工具栏')}</div>
              <WordMark />
            </div>
            <div id={Page.help} className={styles.pageItem}>
              <div className={styles.pageTitle}>{__i18n('帮助与反馈')}</div>
              <Help />
            </div>
            <div id={Page.about} className={styles.pageItem}>
              <div className={styles.pageTitle}>{__i18n('关于语雀插件')}</div>
              <About />
            </div>
          </div>
        </div>
      </AccountLayout>
    </AntdLayout>
  );
}

export default App;
