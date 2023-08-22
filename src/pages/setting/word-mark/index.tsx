import React, { useEffect, useState } from 'react';
import { Switch, Select } from 'antd';
import {
  updateWordMarkConfig,
  getWordMarkConfig,
  IWordMarkConfig,
  WordMarkConfigKey,
} from '@/core/account';
import proxy from '@/core/proxy';
import BookWithIcon from '@/components/book-with-icon';
import { Book } from '@/core/interface';
import styles from './index.module.less';


function WordMark() {
  const [ enable, setEnable ] = useState(false);
  const [ books, setBooks ] = useState<Array<Book>>([
    {
      type: 'Note',
      id: 0,
      get name() {
        return __i18n('小记');
      },
    },
  ]);
  const [ savePosition, setSavePosition ] = useState<
  IWordMarkConfig['defaultSavePosition']
  >({
    type: 'Note',
    id: 0,
    get name() {
      return __i18n('小记');
    },
  });

  const onEnableWordMarkChange = async () => {
    await updateWordMarkConfig(WordMarkConfigKey.enable, !enable);
    setEnable(!enable);
  };

  const onChangeSavePosition = async (id: number) => {
    const item = books.find(item => item.id === id);
    await updateWordMarkConfig(WordMarkConfigKey.defaultSavePosition, {
      id: item.id,
      type: item.type,
      name: item.name,
      creator_id: item.creator_id,
    });
    setSavePosition(item);
  }

  useEffect(() => {
    getWordMarkConfig().then(res => {
      setEnable(res.enable);
      setSavePosition(res.defaultSavePosition);
    });
    proxy.book.getBooks().then(res => {
      setBooks(books => [ ...books, ...res ]);
    });
  }, []);

  return (
    <div className={styles.configWrapper}>
      <div className={styles.configItem}>
        <p className={styles.configDesc}>
          {__i18n('选中文本时，展示划词快捷指令功能')}
        </p>
        <Switch checked={enable} onChange={onEnableWordMarkChange} />
      </div>
      <div className={styles.configItem}>
        <p className={styles.configDesc}>{__i18n('划词剪藏默认保存位置')}</p>
        <Select
          className={styles.list}
          value={savePosition.id}
          options={books?.map(book => ({
            value: book.id,
            label: <BookWithIcon book={book} />,
          }))}
          onChange={(value) => onChangeSavePosition(value)}
        />
      </div>
    </div>
  );
}

export default React.memo(WordMark);
