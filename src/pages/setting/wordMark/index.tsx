import React, { useEffect, useState } from 'react';
import { Switch } from 'antd';
import { IWordMarkConfig, WordMarkConfigKey } from '@/isomorphic/constant/wordMark';
import SelectSavePosition from '@/components/SelectSavePosition';
import { backgroundBridge } from '@/core/bridge/background';
import styles from './index.module.less';

function WordMark() {
  const [config, setConfig] = useState<IWordMarkConfig | null>(null);

  const onConfigChange = async (key: WordMarkConfigKey, value: any) => {
    await backgroundBridge.wordMarkConfig.update(key, value, { notice: true });
    setConfig({
      ...(config as IWordMarkConfig),
      [key]: value,
    });
  };

  useEffect(() => {
    backgroundBridge.wordMarkConfig.get().then(res => {
      setConfig(res);
    });
  }, []);

  if (!config) {
    return null;
  }

  return (
    <div className={styles.configWrapper}>
      <div className={styles.card}>
        <div className={styles.title}>{__i18n('全局设置')}</div>
        <div className={styles.body}>
          <div className={styles.configItem}>
            <div className={styles.desc}>{__i18n('默认启动划词工具栏')}</div>
            <Switch
              checked={config.enable}
              onChange={() =>
                onConfigChange(WordMarkConfigKey.enable, !config.enable)
              }
            />
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.title}>{__i18n('划词剪藏')}</div>
        <div className={styles.body}>
          <div className={styles.configItem}>
            <div className={styles.desc}>{__i18n('默认保存位置')}</div>
            <SelectSavePosition
              onChange={item => {
                backgroundBridge.wordMarkConfig.update(
                  WordMarkConfigKey.defaultSavePosition,
                  item,
                );
              }}
              defaultSavePosition={config.defaultSavePosition}
            />
          </div>
          <div className={styles.configItem}>
            <div className={styles.desc}>{__i18n('每次都唤起剪藏面板')}</div>
            <Switch
              checked={config.evokePanelWhenClip}
              onChange={() =>
                onConfigChange(
                  WordMarkConfigKey.evokePanelWhenClip,
                  !config.evokePanelWhenClip,
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(WordMark);
