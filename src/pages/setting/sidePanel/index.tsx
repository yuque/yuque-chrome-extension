import React, { useCallback, useEffect, useState } from 'react';
import { Switch } from 'antd';
import { backgroundBridge } from '@/core/bridge/background';
import {
  ILevitateConfig,
  LevitateConfigKey,
} from '@/isomorphic/constant/levitate';
import { ClipConfigKey, IClipConfig } from '@/isomorphic/constant/clip';
import DisableUrlCard, { IDisableUrlItem } from '@/components/DisableUrlCard';
import styles from './index.module.less';

function Shortcut() {
  const [config, setConfig] = useState({} as ILevitateConfig);
  const [clipConfig, setClipConfig] = useState({} as IClipConfig);

  const onConfigChange = useCallback(
    async (key: LevitateConfigKey, value: any) => {
      await backgroundBridge.configManager.update('levitate', key, value, {
        notice: true,
      });
      setConfig(pre => ({
        ...pre,
        [key]: value,
      }));
    },
    [],
  );

  const onClipConfigChange = async (key: ClipConfigKey, value: any) => {
    await backgroundBridge.configManager.update('clip', key, value, {
      notice: true,
    });
    setClipConfig(pre => ({
      ...pre,
      [key]: value,
    }));
  };

  const onDelete = useCallback(
    (item: IDisableUrlItem, index: number) => {
      const filterArray = config.disableUrl?.filter(
        d => d.origin !== item.origin,
      );
      onConfigChange('disableUrl', filterArray);
    },
    [config],
  );

  useEffect(() => {
    backgroundBridge.configManager.get('levitate').then(res => {
      setConfig(res);
    });
    backgroundBridge.configManager.get('clip').then(res => {
      setClipConfig(res);
    });
  }, []);

  return (
    <div className={styles.configWrapper}>
      <div className={styles.configCard}>
        <div className={styles.body}>
          <div className={styles.configItem}>
            <div className={styles.desc}>{__i18n('剪藏内容保留来源地址')}</div>
            <Switch
              checked={clipConfig.addLink}
              onChange={() =>
                onClipConfigChange('addLink', !clipConfig.addLink)
              }
              size="small"
            />
          </div>
          <div className={styles.configItem}>
            <div className={styles.desc}>{__i18n('展示侧边栏悬浮气泡')}</div>
            <Switch
              checked={config.enable}
              onChange={() => onConfigChange('enable', !config.enable)}
              size="small"
            />
          </div>
          {!!config.disableUrl?.length && (
            <div>
              <div className={styles.desc}>
                {__i18n('管理不展示侧边栏气泡的页面')}
              </div>
              <div className={styles.disableUrlCard}>
                <DisableUrlCard
                  options={config.disableUrl}
                  onDelete={onDelete}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(Shortcut);
