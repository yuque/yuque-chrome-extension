import React, { useMemo, useState } from 'react';
import LarkIcon from '@/components/LarkIcon';
import { PushpinOutlined, PushpinFilled } from '@ant-design/icons';
import classnames from 'classnames';
import { wordMarkConfigManager, WordMarkOptionTypeEnum } from '@/core/configManager/wordMark';
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
  const [toolbarKeys, setToolbarKeys] = useState<WordMarkOptionTypeEnum[]>(wordMarkContext.toolbars);

  const updateToolbar = (list: ToolbarItem[]) => {
    const result = list.map(item => item.id) as WordMarkOptionTypeEnum[];
    setToolbarKeys(result);
    wordMarkConfigManager.update('toolbars', result);
  };

  const toolbars = useMemo(() => {
    return toolbarKeys
      .map(key => {
        const item = defaultToolbars.find(toolbarItem => toolbarItem.id === key);
        return item;
      })
      .filter(item => !!item);
  }, [toolbarKeys]) as ToolbarItem[];

  return (
    <div className={styles.menus}>
      <DragList
        dataSource={toolbars.filter(item => !wordMarkContext.disableFunction.includes(item.id as any))}
        renderItem={item => {
          const { type, name } = item;
          const pinned = pinList.includes(type);
          return (
            <div className={styles.menuItem} key={type}>
              <div className={styles.nameWrapper} onClick={() => executeCommand(type)}>
                <LarkIcon name={item.icon} className={styles.itemIcon} />
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
