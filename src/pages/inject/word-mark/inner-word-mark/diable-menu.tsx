import React, { useContext } from 'react';
import Chrome from '@/core/chrome';
import { BACKGROUND_EVENTS } from '@/events';
import { WordMarkContext } from '@/context/word-mark-context';
import { WordMarkConfigKey, getPageUrl } from '@/isomorphic/word-mark';
import { __i18n } from '@/isomorphic/i18n';
import styles from './disable-menu.module.less';

function DisableMenu() {
  const context = useContext(WordMarkContext);
  const disableForever = () => {
    Chrome.runtime.sendMessage({
      action: BACKGROUND_EVENTS.UPDATE_WORD_MARK_CONFIG,
      data: {
        key: WordMarkConfigKey.enable,
        value: false,
        option: {
          notice: true,
        },
      },
    });
  };

  const disableForPage = () => {
    Chrome.runtime.sendMessage({
      action: BACKGROUND_EVENTS.UPDATE_WORD_MARK_CONFIG,
      data: {
        key: WordMarkConfigKey.disableUrl,
        value: getPageUrl(),
        option: {
          notice: true,
        },
      },
    })
  }

  const disableOnce = () => {
    context.destroyWordMark();
  };

  const openSetting = () => {
    Chrome.runtime.sendMessage({
      action: BACKGROUND_EVENTS.OPEN_SETTING_PAGE,
    });
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
        <div onClick={openSetting} className={styles.link}>{__i18n('设置')}</div>
        {__i18n('中开启')}
      </div>
    </>
  );
}

export default React.memo(DisableMenu);
