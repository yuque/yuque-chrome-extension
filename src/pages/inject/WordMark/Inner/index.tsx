import React, { useCallback, useEffect, useState } from 'react';
import { Popover, Tooltip } from 'antd';
import { wordMarkConfigManager, WordMarkOptionTypeEnum } from '@/core/configManager/wordMark';
import { useWordMarkContext } from '@/components/WordMarkLayout/useWordMarkContext';
import Typography from '@/components/Typography';
import LarkIcon from '@/components/LarkIcon';
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
  const [pinedTools, setPinedTools] = useState<WordMarkOptionTypeEnum[]>(wordMarkContext.filterInnerPinList);

  const handlePin = useCallback((type: WordMarkOptionTypeEnum) => {
    setPinedTools(tools => {
      const result = tools.includes(type) ? tools.filter(t => t !== type) : [type, ...tools];
      wordMarkConfigManager.update('innerPinList', result);
      return result;
    });
  }, []);

  useEffect(() => {
    setPinedTools(wordMarkContext.filterInnerPinList);
  }, [wordMarkContext]);

  return (
    <div className={styles.innerWordMarkWrapper}>
      <LarkIcon name="yuque-logo" className={styles.yuqueLogo} />
      <div className={styles.pinList}>
        {toolbars.map(item => {
          const pinned = pinedTools.includes(item.type);
          if (!pinned) {
            return null;
          }
          if (pinedTools.length > 3) {
            return (
              <Tooltip title={item.name} key={item.type}>
                <Typography
                  type="iconButton"
                  ml={6}
                  mr={6}
                  onClick={() => executeCommand(item.type)}
                  className={styles.smallIcon}
                >
                  <LarkIcon name={item.icon} className={styles.itemIcon} />
                </Typography>
              </Tooltip>
            );
          }
          return (
            <div className={styles.pinToolbarItem} key={item.type} onClick={() => executeCommand(item.type)}>
              <LarkIcon name={item.icon} className={styles.itemIcon} />
              <span className={styles.name}>{item.name}</span>
            </div>
          );
        })}
      </div>
      <Popover
        placement="bottomRight"
        content={<OperateMenu pinList={pinedTools} executeCommand={executeCommand} handlePin={handlePin} />}
        overlayClassName={styles.overlayClassName}
      >
        <div className={styles.moreActions}>
          <LarkIcon name="more" />
        </div>
      </Popover>
      {(wordMarkContext.enable || !wordMarkContext.evokeWordMarkShortKey) && (
        <>
          <div className={styles.line} />
          <Popover placement="bottomRight" content={<DisableMenu />} overlayClassName={styles.overlayClassName}>
            <div className={styles.closeActions}>
              <LarkIcon name="close-outline" size={14} />
            </div>
          </Popover>
        </>
      )}
    </div>
  );
}

export default React.memo(InnerWordMark);
