import React, { useMemo, useState } from 'react';
import Icon from '@ant-design/icons';
import { PushpinOutlined, PushpinFilled } from '@ant-design/icons';
import classnames from 'classnames';
import { backgroundBridge } from '@/core/bridge/background';
import { WordMarkOptionTypeEnum } from '@/isomorphic/constants';
import { WordMarkConfigKey } from '@/isomorphic/constant/wordMark';
import { useWordMarkContext } from '@/components/WordMarkLayout/useWordMarkContext';
import DragList from '@/components/DragList';
import { ToolbarItem, toolbars as defaultToolbars } from '../constants';
import styles from './OperateMenu.module.less';

interface IOperateMenuProps {
  pinList: WordMarkOptionTypeEnum[];
  handlePin: (type: WordMarkOptionTypeEnum) => void;
  executeCommand: (type: WordMarkOptionTypeEnum) => void;
}

function OperateMenu(props: IOperateMenuProps) {
  const { pinList, handlePin, executeCommand } = props;
  const wordMarkContext = useWordMarkContext();
  const [toolbarKeys, setToolbarKeys] = useState<WordMarkOptionTypeEnum[]>(
    wordMarkContext.toolbars,
  );

  const updateToolbar = (list: ToolbarItem[]) => {
    const result = list.map(item => item.id) as WordMarkOptionTypeEnum[];
    setToolbarKeys(result);
    backgroundBridge.wordMarkConfig.update(WordMarkConfigKey.toolbars, result);
  };

  const toolbars = useMemo(() => {
    return toolbarKeys
      .map(key => {
        const item = defaultToolbars.find(
          toolbarItem => toolbarItem.id === key,
        );
        return item;
      })
      .filter(item => !!item);
  }, [toolbarKeys]) as ToolbarItem[];

  return (
    <div className={styles.menus}>
      <DragList
        dataSource={toolbars}
        renderItem={item => {
          const { type, name, icon } = item;
          const pinned = pinList.includes(type);
          return (
            <div className={styles.menuItem} key={type}>
              <div
                className={styles.nameWrapper}
                onClick={() => executeCommand(type)}
              >
                <Icon component={icon} className={styles.icon} />
                <span>{name}</span>
              </div>
              <div
                className={classnames(styles.action, {
                  [styles.pinned]: pinned,
                })}
                onClick={() => handlePin(type)}
              >
                {pinned ? <PushpinFilled /> : <PushpinOutlined />}
              </div>
            </div>
          );
        }}
        onDragEnd={updateToolbar}
      />
    </div>
  );
}

export default React.memo(OperateMenu);
