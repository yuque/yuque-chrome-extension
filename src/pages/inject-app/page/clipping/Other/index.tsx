import React, { useContext } from 'react';
import classnames from 'classnames';
import { Switch } from 'antd';
import { WordMarkConfigKey } from '@/isomorphic/word-mark';
import { __i18n } from '@/isomorphic/i18n';
import { InjectAppContext } from '@/context/inject-app-context';
import styles from './styles.module.less';
import { sendMessageToBack } from '@/core/bridge/inject-to-background';
import { BACKGROUND_EVENTS } from '@/events';

interface OtherProps {
  className?: string;
}

export const Other = (props: OtherProps) => {
  const { wordMarkConfig, updateWordMarkConfig } = useContext(InjectAppContext);

  const onConfigChange = async (key: WordMarkConfigKey, value: any) => {
    await sendMessageToBack(BACKGROUND_EVENTS.UPDATE_WORD_MARK_CONFIG, {
      key,
      value,
    });
    updateWordMarkConfig({
      ...wordMarkConfig,
      [key]: value,
    });
  };

  if (!wordMarkConfig) {
    return null;
  }

  return (
    <div className={classnames(styles.wrapper, props.className)}>
      <div className={styles.menu}>
        <div className={styles.item}>
          <div>{__i18n('划词快捷指令')}</div>
          <Switch
            checked={wordMarkConfig.enable}
            onChange={() =>
              onConfigChange(WordMarkConfigKey.enable, !wordMarkConfig.enable)
            }
          />
        </div>
      </div>
    </div>
  );
};
