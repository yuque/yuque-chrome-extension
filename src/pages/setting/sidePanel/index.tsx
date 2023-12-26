import React, { useCallback, useEffect, useState } from 'react';
import { Switch } from 'antd';
import { ILevitateConfig, LevitateConfigKey, levitateConfigManager } from '@/core/configManager/levitate';
import { ClipConfigKey, IClipConfig, clipConfigManager } from '@/core/configManager/clip';
import DisableUrlCard, { IDisableUrlItem } from '@/components/DisableUrlCard';
import styles from './index.module.less';

function Shortcut() {
  const [config, setConfig] = useState({} as ILevitateConfig);
  const [clipConfig, setClipConfig] = useState({} as IClipConfig);

  const onConfigChange = useCallback(async (key: LevitateConfigKey, value: any) => {
    await levitateConfigManager.update(key, value);
    setConfig(pre => ({
      ...pre,
      [key]: value,
    }));
  }, []);

  const onClipConfigChange = async (key: ClipConfigKey, value: any) => {
    await clipConfigManager.update(key, value);
    setClipConfig(pre => ({
      ...pre,
      [key]: value,
    }));
  };

  const onDelete = useCallback(
    (item: IDisableUrlItem) => {
      const filterArray = config.disableUrl?.filter(d => d.origin !== item.origin);
      onConfigChange('disableUrl', filterArray);
    },
    [config],
  );

  useEffect(() => {
    levitateConfigManager.get().then(res => {
      setConfig(res);
    });

    clipConfigManager.get().then(res => {
      setClipConfig(res);
    });
  }, []);

  return (
    <div className={styles.configWrapper}>
      <div className={styles.configCard}>
        <div className={styles.body}>
          <div className={styles.configItem}>
            <div className={styles.desc}>{__i18n('展示侧边栏悬浮气泡')}</div>
            <Switch checked={config.enable} onChange={() => onConfigChange('enable', !config.enable)} size="small" />
          </div>
          {!!config.disableUrl?.length && (
            <div>
              <div className={styles.desc}>{__i18n('管理不展示侧边栏气泡的页面')}</div>
              <div className={styles.disableUrlCard}>
                <DisableUrlCard options={config.disableUrl} onDelete={onDelete} />
              </div>
            </div>
          )}
          <div className={styles.configItem}>
            <div className={styles.desc}>{__i18n('剪藏内容保留来源地址')}</div>
            <Switch
              checked={clipConfig.addLink}
              onChange={() => onClipConfigChange('addLink', !clipConfig.addLink)}
              size="small"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Shortcut);
