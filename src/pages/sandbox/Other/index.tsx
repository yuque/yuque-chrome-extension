import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { Switch } from 'antd';
import { wordMarkConfigManager } from '@/core/manager/word-mark-config';
import { IWordMarkConfig, WordMarkConfigKey } from '@/isomorphic/word-mark';
import { __i18n } from '@/isomorphic/i18n';
import styles from './styles.module.less';


interface OtherProps {
  className?: string;
}

export const Other = (props: OtherProps) => {
  const [ config, setConfig ] = useState<IWordMarkConfig>();

  const onConfigChange = async (key: WordMarkConfigKey, value: any) => {
    await wordMarkConfigManager.update(key, value, { notice: true });
    setConfig({
      ...config,
      [key]: value,
    });
  };
  useEffect(() => {
    wordMarkConfigManager.get().then(setConfig);
  }, []);

  if (!config) {
    return null;
  }

  return (
    <div className={classnames(styles.wrapper, props.className)}>
      <div className={styles.menu}>
        <div className={styles.item}>
          <div>{__i18n('划词快捷指令')}</div>
          <Switch
            checked={config.enable}
            onChange={() =>
              onConfigChange(WordMarkConfigKey.enable, !config.enable)
            }
          />
        </div>
      </div>
    </div>
  );
};
