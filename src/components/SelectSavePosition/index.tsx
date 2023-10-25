import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Select } from 'antd';
import Icon from '@ant-design/icons';
import { SelectCommonPlacement } from 'antd/es/_util/motion';
import { backgroundBridge } from '@/core/bridge/background';
import {
  DefaultSavePosition,
  ISavePosition,
} from '@/core/bridge/background/request/mine';
import ArrowDown from '@/assets/svg/arrow-down.svg';
import styles from './index.module.less';

export interface ISelectSavePositionProps {
  onChange?: (item: ISavePosition) => void;
  // 是否支持记住
  rememberKey?: string;
  placement?: SelectCommonPlacement;
  defaultSavePosition?: ISavePosition;
}

function SelectSavePosition(props: ISelectSavePositionProps) {
  const { rememberKey, placement = 'bottomLeft', onChange } = props;
  const [selectSaveItem, setSelectSaveItem] = useState<ISavePosition>();
  const [savePositionList, setSavePositionList] = useState<ISavePosition[]>([]);

  const getDefaultSavePosition = async () => {
    if (props.defaultSavePosition) {
      setSelectSaveItem(props.defaultSavePosition);
      setSavePositionList([{ ...props.defaultSavePosition }]);
      return;
    }
    if (!rememberKey) {
      setSelectSaveItem(DefaultSavePosition);
      setSavePositionList([{ ...DefaultSavePosition }]);
      return;
    }
    const defaultSavePosition = await backgroundBridge.storage.get(rememberKey);
    const positionItem = (defaultSavePosition ||
      DefaultSavePosition) as ISavePosition;
    setSavePositionList([{ ...positionItem }]);
    setSelectSaveItem(positionItem);
  };

  const updateBookList = async () => {
    const list = await backgroundBridge.request.mine.getBooks();
    setSavePositionList([{ ...DefaultSavePosition }, ...list]);
  };

  const onSelect = useCallback(
    (id: number) => {
      const item = savePositionList.find(i => i.id === id);
      if (rememberKey) {
        backgroundBridge.storage.update(rememberKey, item);
      }
      setSelectSaveItem(item);
    },
    [savePositionList, rememberKey],
  );

  const list = useMemo(() => {
    return savePositionList.map(item => {
      return {
        value: item.id,
        label: item.name,
      };
    });
  }, [savePositionList]);

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
    <Select
      value={selectSaveItem?.id}
      style={{ width: 120 }}
      placement={placement}
      options={list}
      onSelect={onSelect}
      className={styles.selectWrapper}
      suffixIcon={<Icon component={ArrowDown} className={styles.iconWrapper} />}
    />
  );
}

export default React.memo(SelectSavePosition);
