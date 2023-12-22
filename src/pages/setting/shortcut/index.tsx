import React from 'react';
import Icon from '@ant-design/icons';
import { backgroundBridge } from '@/core/bridge/background';
import useClipShortCut from '@/hooks/useClipShortCut';
import ShortcutItem from '@/components/ShortItem';
import { browserSystemLink } from '@/core/browser-system-link';
import ArrowDownSvg from '@/assets/svg/arrow-down.svg';
import styles from './index.module.less';

function Shortcut() {
  const shortcutMap = useClipShortCut();
  const openShortCut = () => {
    backgroundBridge.tab.create(browserSystemLink.shortCut);
  };

  return (
    <>
      <div className={styles.pageDesc}>
        <span>
          {__i18n(
            '浏览器插件快捷键需在「扩展管理页面」中设置，以下展示已设置的快捷键',
          )}
        </span>
        <div onClick={openShortCut} className={styles.setting}>
          {__i18n('去设置')}
          <Icon component={ArrowDownSvg} className={styles.icon} />
        </div>
      </div>
      <div className={styles.configCard}>
        <div className={styles.body}>
          <div className={styles.configItem}>
            <div className={styles.desc}>{__i18n('快捷唤起侧边栏')}</div>
            <ShortcutItem
              defaultShortcut={shortcutMap.openSidePanel}
              readonly
            />
          </div>
          <div className={styles.configItem}>
            <div className={styles.desc}>{__i18n('选取剪藏')}</div>
            <ShortcutItem defaultShortcut={shortcutMap.selectArea} readonly />
          </div>
          <div className={styles.configItem}>
            <div className={styles.desc}>{__i18n('OCR 提取')}</div>
            <ShortcutItem defaultShortcut={shortcutMap.startOcr} readonly />
          </div>
          <div className={styles.configItem}>
            <div className={styles.desc}>{__i18n('全文剪藏')}</div>
            <ShortcutItem defaultShortcut={shortcutMap.clipPage} readonly />
          </div>
        </div>
      </div>
    </>
  );
}

export default React.memo(Shortcut);
