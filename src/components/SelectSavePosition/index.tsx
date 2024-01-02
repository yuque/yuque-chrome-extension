import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Select } from 'antd';
import { SelectCommonPlacement } from 'antd/es/_util/motion';
import { webProxy } from '@/core/webProxy';
import { DefaultSavePosition, ISavePosition } from '@/core/webProxy/mine';
import { __i18n } from '@/isomorphic/i18n';
import { storage } from '@/isomorphic/storage';
import LarkIcon from '../LarkIcon';
import styles from './index.module.less';

export interface ISelectSavePositionProps {
  onChange?: (item: ISavePosition) => void;
  // 是否支持记住
  rememberKey?: string;
  placement?: SelectCommonPlacement;
  defaultSavePosition?: ISavePosition;
  children?: React.ReactNode;
}

type PositionType = 'book' | 'note';

function SelectSavePosition(props: ISelectSavePositionProps) {
  const [position, setPosition] = useState<PositionType>('note');
  const { rememberKey, placement = 'bottomLeft', onChange } = props;
  const [selectSaveItem, setSelectSaveItem] = useState<ISavePosition>();
  const [books, setBooks] = useState<ISavePosition[]>([]);

  const initPositionState = (item: ISavePosition) => {
    // 小记
    if (!item.id) {
      setPosition('note');
      setSelectSaveItem(item);
      return;
    }
    setPosition('book');
    if (!books.length) {
      setBooks([{ ...item }]);
    }
    setSelectSaveItem(item);
  };

  const getDefaultSavePosition = async () => {
    if (props.defaultSavePosition) {
      initPositionState(props.defaultSavePosition);
      return;
    }
    if (!rememberKey) {
      initPositionState(DefaultSavePosition);
      return;
    }
    const defaultSavePosition = await storage.get(rememberKey);
    const positionItem = (defaultSavePosition || DefaultSavePosition) as ISavePosition;
    initPositionState(positionItem);
  };

  const updateBookList = async () => {
    const list = await webProxy.mine.getBooks();
    setBooks([...list]);
  };

  const onSelectBook = useCallback(
    (id: number) => {
      const item = books.find(i => i.id === id);
      if (rememberKey) {
        storage.update(rememberKey, item);
      }
      setSelectSaveItem(item);
    },
    [books, rememberKey],
  );

  const positionList = useMemo(() => {
    return [
      { value: 'note', label: __i18n('存为小记') },
      { value: 'book', label: __i18n('存为文档') },
    ];
  }, []);

  const bookList = useMemo(() => {
    return books.map(item => {
      return {
        value: item.id,
        label: item.name,
      };
    });
  }, [books]);

  const onChangePosition = useCallback(
    (value: PositionType) => {
      if (value === 'note') {
        setSelectSaveItem(DefaultSavePosition);
        if (rememberKey) {
          storage.update(rememberKey, DefaultSavePosition);
        }
      } else {
        books[0] && onSelectBook(books[0].id);
      }
      setPosition(value);
    },
    [books, rememberKey],
  );

  useEffect(() => {
    getDefaultSavePosition();
    updateBookList();
  }, []);

  useEffect(() => {
    if (selectSaveItem && onChange) {
      onChange(selectSaveItem);
    }
  }, [selectSaveItem]);

  return (
    <div className={styles.wrapper}>
      <Select
        value={position}
        style={{ width: 120 }}
        placement={placement}
        options={positionList}
        onSelect={onChangePosition}
        className={styles.selectWrapper}
        suffixIcon={<LarkIcon name="arrow-down" className={styles.iconWrapper} />}
      />
      {position === 'book' && !!selectSaveItem?.id ? (
        <Select
          value={selectSaveItem?.id}
          style={{ width: 120 }}
          placement={placement}
          options={bookList}
          onSelect={onSelectBook}
          className={styles.selectWrapper}
          suffixIcon={<LarkIcon name="arrow-down" className={styles.iconWrapper} />}
        />
      ) : (
        props.children
      )}
    </div>
  );
}

export default React.memo(SelectSavePosition);
