import React, { useCallback, useEffect, useState } from 'react';
import { Popover } from 'antd';
import Icon from '@ant-design/icons';
import Chrome from '@/core/chrome';
import { WordMarkOptionTypeEnum } from '@/isomorphic/constants';
import { BACKGROUND_EVENTS } from '@/events';
import YuqueLogo from '@/assets/svg/yuque-logo.svg';
import More from '@/assets/svg/more.svg';
import { IKernelEditorRef } from '@/components/lake-editor/kernel-editor';
import { toolbars } from '../constants';
import OperateMenu from './operate-menu';
import styles from './index.module.less';

interface InnerWordMarkProps {
  executeCommand: (type: string) => void;
  editorRef: React.MutableRefObject<IKernelEditorRef>;
}

function InnerWordMark(props: InnerWordMarkProps) {
  const { executeCommand, editorRef } = props;
  const [ pinedTools, setPinedTools ] = useState<WordMarkOptionTypeEnum[]>([
    WordMarkOptionTypeEnum.explain,
  ]);

  const initDefaultPinList = async () => {
    Chrome.runtime.sendMessage(
      {
        action: BACKGROUND_EVENTS.GET_WORD_MARK_PIN,
      },
      res => {
        setPinedTools(res.result || []);
      },
    );
  };

  const handlePin = useCallback((type: WordMarkOptionTypeEnum) => {
    setPinedTools(tools => {
      const result = tools.includes(type)
        ? tools.filter(t => t !== type)
        : [ type, ...tools ];

      Chrome.runtime.sendMessage({
        action: BACKGROUND_EVENTS.UPDATE_WORD_MARK_PIN,
        data: {
          pinList: result,
        },
      });
      return result;
    });
  }, []);

  useEffect(() => {
    initDefaultPinList();
  }, []);

  return (
    <div
      className={styles.innerWordMarkWrapper}
      style={{
        width: `${pinedTools.length * 62 + 68}px`,
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
        trigger="click"
        overlayClassName={styles.overlayClassName}
      >
        <div className={styles.moreActions}>
          <Icon component={More} />
        </div>
      </Popover>
    </div>
  );
}

export default React.memo(InnerWordMark);
