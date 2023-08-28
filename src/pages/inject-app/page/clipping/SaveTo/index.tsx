import React, { useCallback, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Select, Menu } from 'antd';
import classnames from 'classnames';
import type { MenuInfo } from 'rc-menu/lib/interface';
import BookWithIcon from '@/components/common/book-with-icon';
import { SELECT_TYPES } from '@/pages/inject-app/constants/select-types';
import NoteTag from '@/components/note-tag';
import { useViewModel } from './useViewModel';
import styles from './index.module.less';


const NODE_DATA_ID = 0;

export interface ISaveToProps {
  className?: string;
}

export default function SaveTo(props: ISaveToProps) {
  const {
    state: { books, currentBookId, loading, currentType, noteTagRef },
    onSave,
    onSelectType,
    onSelectBookId,
  } = useViewModel();

  const handleTypeSelect = useCallback((info: MenuInfo) => {
    onSelectType(info.key);
  }, []);

  useEffect(() => {
    const tagWrapper = document.querySelector('#tag-wrapper');
    const root = createRoot(tagWrapper);
    root.render(<NoteTag ref={noteTagRef} />);
    return () => {
      root.unmount();
    };
  }, []);

  useEffect(() => {
    const tagWrapper = document.querySelector('#tag-wrapper');
    if (currentBookId !== NODE_DATA_ID) {
      tagWrapper.classList.add('hidden');
    } else {
      tagWrapper.classList.remove('hidden');
    }
  }, [ currentBookId ]);

  const SELECT_MENU_DATA = useMemo(
    () =>
      SELECT_TYPES.map(item => ({
        key: item.key,
        icon: item.icon,
        label: item.text,
      })),
    [],
  );

  return (
    <div className={classnames(styles.wrapper, props.className)}>
      <div className={styles.actionTip}>{__i18n('选择剪藏方式')}</div>
      <Menu
        mode="inline"
        inlineIndent={8}
        activeKey={currentType}
        onClick={handleTypeSelect}
        items={SELECT_MENU_DATA}
        className={styles.menu}
      />
      <div className={classnames(styles.actionTip, styles.clipTarget)}>
        {__i18n('剪藏到')}
      </div>
      <Select<number>
        className={styles.list}
        onChange={(value: number) => onSelectBookId(Number(value))}
        defaultValue={currentBookId}
        options={books.map(book => ({
          value: book.id,
          label: <BookWithIcon book={book} />,
        }))}
        getPopupContainer={node => node}
      />
      <Button
        className={styles.button}
        type="primary"
        block
        loading={loading}
        disabled={!currentType}
        onClick={onSave}
      >
        {__i18n('保存到')}
        {currentBookId === NODE_DATA_ID ? __i18n('小记') : __i18n('知识库')}
      </Button>
    </div>
  );
}
