import React, { useEffect, useState } from 'react';
import { backgroundBridge } from '@/core/bridge/background';
import ShortcutItem from '@/components/ShortItem';
import { browserSystemLink } from '@/core/browser-system-link';
import styles from './index.module.less';

interface IShortcutMap {
  collectLink?: string;
  openSidePanel?: string;
  selectArea?: string;
  selectOcr?: string;
}

function Shortcut() {
  const [shortcutMap, setShortcutMap] = useState<IShortcutMap>({});
  const openShortCut = () => {
    backgroundBridge.tab.create(browserSystemLink.shortCut);
  };

  useEffect(() => {
    backgroundBridge.user.getUserShortCut().then(res => {
      const map: IShortcutMap = {};
      for (const item of res) {
        map[item.name as keyof IShortcutMap] = item.shortcut;
      }
      setShortcutMap(map);
    });
  }, []);

  return (
    <div className={styles.configWrapper}>
      <div className={styles.pageDesc}>
        <span>
          {__i18n(
            '浏览器插件快捷键需在「扩展管理页面」中设置，以下展示已设置的快捷键',
          )}
        </span>
        <div onClick={openShortCut} className={styles.setting}>
          {__i18n('去设置')}
        </div>
      </div>
      <div className={styles.card}>
        <div className={styles.title}>{__i18n('侧边栏')}</div>
        <div className={styles.body}>
          <div className={styles.configItem}>
            <div className={styles.desc}>{__i18n('快捷唤起划词工具栏')}</div>
            <ShortcutItem
              defaultShortcut={shortcutMap.openSidePanel}
              readonly
            />
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.title}>{__i18n('剪藏方式')}</div>
        <div className={styles.body}>
          <div className={styles.configItem}>
            <div className={styles.desc}>{__i18n('选取剪藏')}</div>
            <ShortcutItem defaultShortcut={shortcutMap.selectArea} readonly />
          </div>
          <div className={styles.configItem}>
            <div className={styles.desc}>{__i18n('OCR 提取')}</div>
            <ShortcutItem defaultShortcut={shortcutMap.selectOcr} readonly />
          </div>
          <div className={styles.configItem}>
            <div className={styles.desc}>{__i18n('收藏链接')}</div>
            <ShortcutItem defaultShortcut={shortcutMap.collectLink} readonly />
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Shortcut);
