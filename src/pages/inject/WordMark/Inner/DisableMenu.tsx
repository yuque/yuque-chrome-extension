import React from 'react';
import { __i18n } from '@/isomorphic/i18n';
import LinkHelper from '@/isomorphic/link-helper';
import { backgroundBridge } from '@/core/bridge/background';
import { useWordMarkContext } from '@/components/WordMarkLayout/useWordMarkContext';
import { wordMarkConfigManager } from '@/core/configManager/wordMark';
import styles from './DisableMenu.module.less';

function DisableMenu() {
  const { disableUrl, destroyWordMark } = useWordMarkContext();
  const disableForever = () => {
    wordMarkConfigManager.update('enable', false);
    destroyWordMark?.();
  };

  const disableForPage = () => {
    const iconLink = document.querySelector("link[rel*='icon']") || document.querySelector("link[rel*='Icon']");
    const iconUrl = (iconLink as HTMLLinkElement)?.href;
    wordMarkConfigManager.update('disableUrl', [
      ...disableUrl,
      {
        origin: `${window.location.origin}${window.location.pathname}`,
        icon: iconUrl,
      },
    ]);
    destroyWordMark?.();
  };

  const disableOnce = () => {
    destroyWordMark?.();
  };

  const openSetting = () => {
    backgroundBridge.tab.create(LinkHelper.wordMarkSettingPage);
  };

  return (
    <>
      <div className={styles.menus}>
        <div className={styles.menuItem} onClick={disableOnce}>
          {__i18n('在本次访问关闭')}
        </div>
        <div className={styles.menuItem} onClick={disableForPage}>
          {__i18n('在本页关闭')}
        </div>
        <div className={styles.menuItem} onClick={disableForever}>
          {__i18n('全部关闭')}
        </div>
      </div>
      <div className={styles.footer}>
        {__i18n('可在')}
        <div onClick={openSetting} className={styles.link}>
          {__i18n('设置')}
        </div>
        {__i18n('中开启')}
      </div>
    </>
  );
}

export default React.memo(DisableMenu);
