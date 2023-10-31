import React, { useCallback, useState } from 'react';
import { Popover } from 'antd';
import Icon, { CloseOutlined } from '@ant-design/icons';
import { WordMarkOptionTypeEnum } from '@/isomorphic/constants';
import { WordMarkConfigKey } from '@/isomorphic/constant/wordMark';
import { backgroundBridge } from '@/core/bridge/background';
import { useWordMarkContext } from '@/components/WordMarkLayout/useWordMarkContext';
import YuqueLogo from '@/assets/svg/yuque-logo.svg';
import More from '@/assets/svg/more.svg';
import { toolbars } from '../constants';
import OperateMenu from './OperateMenu';
import DisableMenu from './DisableMenu';
import styles from './index.module.less';

interface InnerWordMarkProps {
  executeCommand: (type: WordMarkOptionTypeEnum) => Promise<void>;
}

function InnerWordMark(props: InnerWordMarkProps) {
  const { executeCommand } = props;
  const wordMarkContext = useWordMarkContext();
  const [pinedTools, setPinedTools] = useState<WordMarkOptionTypeEnum[]>(
    wordMarkContext.innerPinList,
  );

  const handlePin = useCallback((type: WordMarkOptionTypeEnum) => {
    setPinedTools(tools => {
      const result = tools.includes(type)
        ? tools.filter(t => t !== type)
        : [type, ...tools];
      backgroundBridge.configManager.update(
        'wordMark',
        WordMarkConfigKey.innerPinList,
        result,
      );
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
              <Icon component={item.icon} className={styles.itemIcon} />
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
        <Icon component={More} className={styles.moreActions} />
      </Popover>
      <div className={styles.line} />
      <Popover
        placement="bottomRight"
        content={<DisableMenu />}
        overlayClassName={styles.overlayClassName}
      >
        <CloseOutlined className={styles.closeActions} />
      </Popover>
    </div>
  );
}

export default React.memo(InnerWordMark);
