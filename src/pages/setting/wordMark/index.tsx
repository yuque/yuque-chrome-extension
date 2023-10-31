import React, { useEffect, useState } from 'react';
import { Select, Switch } from 'antd';
import { __i18n } from '@/isomorphic//i18n';
import {
  IWordMarkConfig,
  WordMarkConfigKey,
} from '@/isomorphic/constant/wordMark';
import SelectSavePosition from '@/components/SelectSavePosition';
import LinkHelper from '@/isomorphic/link-helper';
import { backgroundBridge } from '@/core/bridge/background';
import { isMacOs } from '@/core/system-info';
import styles from './index.module.less';

const mac = [
  {
    value: '',
    label: '无',
  },
  {
    value: 'Meta',
    label: 'Command',
  },
  {
    value: 'Alt',
    label: 'Alt',
  },
  {
    value: 'Shift',
    label: 'Shift',
  },
  {
    value: 'Control',
    label: 'Ctrl',
  },
];

const windows = [
  {
    value: '',
    label: '无',
  },
  {
    value: 'Alt',
    label: 'Alt',
  },
  {
    value: 'Shift',
    label: 'Shift',
  },
  {
    value: 'Control',
    label: 'Ctrl',
  },
];

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
          {!config.enable && (
            <div className={styles.configItem}>
              <div className={styles.desc}>
                {__i18n('选中文本+按指定修饰键唤起')}
              </div>
              <Select
                value={config[WordMarkConfigKey.evokeWordMarkShortKey]}
                options={isMacOs ? mac : windows}
                style={{ width: '120px' }}
                onChange={(v: string) => {
                  onConfigChange(WordMarkConfigKey.evokeWordMarkShortKey, v);
                }}
              />
            </div>
          )}
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

        <a className={styles.more} href={LinkHelper.feedback} target="_blank">
          {__i18n('需要更多划词快捷指令？')}
        </a>
      </div>
    </div>
  );
}

export default React.memo(WordMark);
