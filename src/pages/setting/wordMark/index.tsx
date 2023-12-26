import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Select, Switch, Row, Col } from 'antd';
import {
  IWordMarkConfig,
  WordMarkConfigKey,
  WordMarkOptionTypeEnum,
  wordMarkConfigManager,
} from '@/core/configManager/wordMark';
import DisableUrlCard, { IDisableUrlItem } from '@/components/DisableUrlCard';
import { ToolbarItem, toolbars } from '@/pages/inject/WordMark/constants';
import { __i18n } from '@/isomorphic/i18n';
import LinkHelper from '@/isomorphic/link-helper';
import LarkIcon from '@/components/LarkIcon';
import SelectSavePosition from '@/components/SelectSavePosition';
import { isMacOs } from '@/core/system-info';
import styles from './index.module.less';

const mac = [
  {
    value: '',
    label: '无',
  },
  {
    value: 'Shift',
    label: 'Shift',
  },
  {
    value: 'Control',
    label: 'Ctrl',
  },
  {
    value: 'Alt',
    label: 'Alt',
  },
  {
    value: 'Meta',
    label: 'Command',
  },
];

const windows = [
  {
    value: '',
    label: '无',
  },
  {
    value: 'Shift',
    label: 'Shift',
  },
  {
    value: 'Control',
    label: 'Ctrl',
  },
  {
    value: 'Alt',
    label: 'Alt',
  },
];

function WordMark() {
  const [config, setConfig] = useState<IWordMarkConfig | null>(null);

  const toolBarSettings = useMemo(() => {
    const result = config?.toolbars.map(item => {
      const enable = !config?.disableFunction.includes(item);
      const info = toolbars.find(t => item === t.type) as ToolbarItem;
      return {
        enable,
        ...info,
      };
    });
    return result;
  }, [config]);

  const onConfigChange = async (key: WordMarkConfigKey, value: any) => {
    await wordMarkConfigManager.update(key, value);
    setConfig({
      ...(config as IWordMarkConfig),
      [key]: value,
    });
  };

  const onEnableFunctionChange = (id: WordMarkOptionTypeEnum, enable: boolean) => {
    let result = config?.disableFunction;
    if (!enable) {
      result?.push(id);
    } else {
      result = result?.filter(item => item !== id);
    }
    onConfigChange('disableFunction', result);
  };

  const onDelete = useCallback(
    (item: IDisableUrlItem) => {
      const filterArray = config?.disableUrl?.filter(d => d.origin !== item.origin);
      onConfigChange('disableUrl', filterArray);
    },
    [config],
  );

  useEffect(() => {
    wordMarkConfigManager.get().then(res => {
      setConfig(res);
    });
  }, []);

  if (!config) {
    return null;
  }

  return (
    <div className={styles.configWrapper}>
      <div className={styles.configCard}>
        <div className={styles.h2Title}>{__i18n('全局设置')}</div>
        <div className={styles.body}>
          <div className={styles.configItem}>
            <div className={styles.desc}>{__i18n('默认启动划词工具栏')}</div>
            <Switch checked={config.enable} onChange={() => onConfigChange('enable', !config.enable)} size="small" />
          </div>
          {!config.enable && (
            <div className={styles.configItem}>
              <div className={styles.desc}>{__i18n('选中文本 + 按指定修饰键唤起')}</div>
              <Select
                value={config.evokeWordMarkShortKey}
                options={isMacOs ? mac : windows}
                style={{ width: '120px' }}
                onChange={(v: string) => {
                  onConfigChange('evokeWordMarkShortKey', v);
                }}
                suffixIcon={<LarkIcon className={styles.iconWrapper} name="arrow-down" />}
              />
            </div>
          )}
          {!!config.disableUrl?.length && config.enable && (
            <div>
              <div className={styles.desc}>{__i18n('管理不展示划词工具栏的页面')}</div>
              <div className={styles.disableUrlCard}>
                <DisableUrlCard options={config.disableUrl} onDelete={onDelete} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.configCard}>
        <div className={styles.h2Title}>{__i18n('划词功能设置')}</div>
        <Row className={styles.toolbarSettingWrapper} gutter={[20, 16]}>
          {toolBarSettings?.map(item => {
            return (
              <Col key={item.id} span={12}>
                <div className={styles.toolbarSettingItem}>
                  <LarkIcon name={item.icon} className={styles.toolbarSettingItemIcon} />
                  <span className={styles.toolbarSettingName}>
                    {item.name}
                    {__i18n('：')}
                    <span className={styles.toolbarSettingDesc}>{item.desc}</span>
                  </span>
                  <Switch
                    checked={item.enable}
                    size="small"
                    onChange={() => {
                      onEnableFunctionChange(item.id as any, !item.enable);
                    }}
                  />
                </div>
              </Col>
            );
          })}
        </Row>
      </div>

      <div className={styles.configCard}>
        <div className={styles.h2Title}>{__i18n('划词剪藏')}</div>
        <div className={styles.body}>
          <div className={styles.configItem}>
            <div className={styles.desc}>{__i18n('默认保存位置')}</div>
            <SelectSavePosition
              onChange={item => {
                wordMarkConfigManager.update('defaultSavePosition', item);
              }}
              defaultSavePosition={config.defaultSavePosition}
            />
          </div>
          <div className={styles.configItem}>
            <div className={styles.desc}>{__i18n('每次都唤起剪藏面板')}</div>
            <Switch
              checked={config.evokePanelWhenClip}
              onChange={() => onConfigChange('evokePanelWhenClip', !config.evokePanelWhenClip)}
              size="small"
            />
          </div>
        </div>

        <a className={styles.more} href={LinkHelper.feedback()} target="_blank">
          {__i18n('需要更多划词快捷指令？')}
        </a>
      </div>
    </div>
  );
}

export default React.memo(WordMark);
