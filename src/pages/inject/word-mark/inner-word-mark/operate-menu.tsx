import React, { useContext, useMemo, useState } from 'react';
import Icon from '@ant-design/icons';
import classnames from 'classnames';
import { WordMarkOptionTypeEnum } from '@/isomorphic/constants';
import { PushpinOutlined, PushpinFilled } from '@ant-design/icons';
import DragList from '@/components/common/drag-list';
import Chrome from '@/core/chrome';
import { WordMarkContext } from '@/context/word-mark-context';
import { BACKGROUND_EVENTS } from '@/events';
import { WordMarkConfigKey } from '@/isomorphic/word-mark';
import { ToolbarItem, toolbars as defaultToolbars } from '../constants';
import styles from './operate-menu.module.less';

interface IOperateMenuProps {
  pinList: WordMarkOptionTypeEnum[];
  handlePin: (type: WordMarkOptionTypeEnum) => void;
  executeCommand: (type: WordMarkOptionTypeEnum) => void;
}

function OperateMenu(props: IOperateMenuProps) {
  const { pinList, handlePin, executeCommand } = props;
  const wordMarkContext = useContext(WordMarkContext);
  const [toolbarKeys, setToolbarKeys] = useState<WordMarkOptionTypeEnum[]>(
    wordMarkContext.toolbars,
  );

  const updateToolbar = (list: ToolbarItem[]) => {
    const result = list.map(item => item.id) as WordMarkOptionTypeEnum[];
    setToolbarKeys(result);
    Chrome.runtime.sendMessage({
      action: BACKGROUND_EVENTS.UPDATE_WORD_MARK_CONFIG,
      data: {
        key: WordMarkConfigKey.toolbars,
        value: result,
      },
    });
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
