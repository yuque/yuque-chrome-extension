import React from 'react';
import { __i18n } from '@/isomorphic/i18n';
import { backgroundBridge } from '@/core/bridge/background';
import { WordMarkConfigKey, wordMarkSettingUrl } from '@/isomorphic/word-mark';
import styles from './DisableMenu.module.less';
import { getPageUrl } from '../util';

function DisableMenu() {
  const disableForever = () => {
    backgroundBridge.wordMarkConfig.update(WordMarkConfigKey.enable, false, {
      notice: true,
    });
  };

  const disableForPage = () => {
    backgroundBridge.wordMarkConfig.update(
      WordMarkConfigKey.disableUrl,
      getPageUrl(),
      {
        notice: true,
      },
    );
  };

  const disableOnce = () => {
    window._yuque_ext_app.removeWordMark();
  };

  const openSetting = () => {
    backgroundBridge.tab.create(wordMarkSettingUrl);
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