import React, { useEffect, useState } from 'react';
import { Switch, Select } from 'antd';
import { wordMarkConfigManager } from '@/core/manager/word-mark-config';
import { IWordMarkConfig, WordMarkConfigKey } from '@/isomorphic/word-mark';
import { mineProxy } from '@/core/proxy/mine';
import BookWithIcon from '@/components/common/book-with-icon';
import { Book } from '@/core/interface';
import styles from './index.module.less';

function WordMark() {
  const [ config, setConfig ] = useState<IWordMarkConfig>(null);
  const [ books, setBooks ] = useState<Array<Book>>([
    {
      type: 'Note',
      id: 0,
      get name() {
        return __i18n('小记');
      },
    },
  ]);

  const onConfigChange = async (key: WordMarkConfigKey, value: any) => {
    await wordMarkConfigManager.update(key, value, { notice: true });
    setConfig({
      ...config,
      [key]: value,
    });
  };

  const onChangeSavePosition = async (id: number) => {
    const item = books.find(i => i.id === id);
    await onConfigChange(WordMarkConfigKey.defaultSavePosition, {
      id: item.id,
      type: item.type,
      name: item.name,
      creator_id: item.creator_id,
    });
  };

  useEffect(() => {
    wordMarkConfigManager.get().then(res => {
      setConfig(res);
    });
    mineProxy.getBooks().then(res => {
      setBooks(bs => [ ...bs, ...res ]);
    });
  }, []);

  if (!config) {
    return null;
  }

  return (
    <div className={styles.configWrapper}>
      <div className={styles.configItem}>
        <p className={styles.configDesc}>
          {__i18n('选中文本时，展示划词快捷指令功能')}
        </p>
        <Switch
          checked={config.enable}
          onChange={() =>
            onConfigChange(WordMarkConfigKey.enable, !config.enable)
          }
        />
      </div>
      <div className={styles.subMenuTitle}>{__i18n('划词剪藏')}</div>
      <div className={styles.configItem}>
        <p className={styles.configDesc}>{__i18n('划词剪藏默认保存位置')}</p>
        <Select
          className={styles.list}
          value={config.defaultSavePosition.id}
          options={books?.map(book => ({
            value: book.id,
            label: <BookWithIcon book={book} key={book.id}/>,
          }))}
          onChange={value => onChangeSavePosition(value)}
        />
      </div>
      <div className={styles.configItem}>
        <p className={styles.configDesc}>{__i18n('每次剪藏后唤起剪藏面板')}</p>
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
  );
}

export default React.memo(WordMark);
