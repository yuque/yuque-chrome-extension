import React, { useCallback, useContext, useState } from 'react';
import { Popover } from 'antd';
import Icon, { CloseOutlined } from '@ant-design/icons';
import Chrome from '@/core/chrome';
import { WordMarkOptionTypeEnum } from '@/isomorphic/constants';
import { WordMarkConfigKey } from '@/isomorphic/word-mark';
import { BACKGROUND_EVENTS } from '@/events';
import YuqueLogo from '@/assets/svg/yuque-logo.svg';
import More from '@/assets/svg/more.svg';
import { WordMarkContext } from '@/context/word-mark-context';
import { toolbars } from '../constants';
import OperateMenu from './operate-menu';
import DisableMenu from './diable-menu';
import styles from './index.module.less';

interface InnerWordMarkProps {
  executeCommand: (type: string) => void;
}

function InnerWordMark(props: InnerWordMarkProps) {
  const { executeCommand } = props;
  const wordMarkContext = useContext(WordMarkContext);
  const [ pinedTools, setPinedTools ] = useState<WordMarkOptionTypeEnum[]>(wordMarkContext.innerPinList);

  const handlePin = useCallback((type: WordMarkOptionTypeEnum) => {
    setPinedTools(tools => {
      const result = tools.includes(type)
        ? tools.filter(t => t !== type)
        : [ type, ...tools ];

      Chrome.runtime.sendMessage({
        action: BACKGROUND_EVENTS.UPDATE_WORD_MARK_CONFIG,
        data: {
          key: WordMarkConfigKey.innerPinList,
          value: result,
        },
      });
      return result;
    });
  }, []);

  return (
    <div
      className={styles.innerWordMarkWrapper}
      style={{
        width: `${pinedTools.length * 62 + 66 + 34}px`,
      }}
    >
      <Icon component={YuqueLogo} className={styles.yuqueLogo} />
      <div className={styles.pinList}>
        {toolbars.map(item => {
          const pinned = pinedTools.includes(item.type);
          if (!pinned) {
            return null;
          }
          return (
            <div
              className={styles.pinToolbarItem}
              key={item.type}
              onClick={() => executeCommand(item.type)}
            >
              <Icon component={item.icon} />
              <span className={styles.name}>{item.name}</span>
            </div>
          );
        })}
      </div>
      <Popover
        placement="bottomRight"
        content={
          <OperateMenu
            pinList={pinedTools}
            executeCommand={executeCommand}
            handlePin={handlePin}
          />
        }
        overlayClassName={styles.overlayClassName}
      >
        <div className={styles.moreActions}>
          <Icon component={More} />
        </div>
      </Popover>
      <Popover 
        content={<DisableMenu />}
        overlayClassName={styles.overlayClassName}
        placement="bottomRight"
      >
        <div className={styles.overlayClassName}>
          <div className={styles.closeActions}>
            <CloseOutlined />
          </div>
        </div>
      </Popover>
    </div>
  );
}

export default React.memo(InnerWordMark);
