import React, { useState, useEffect } from 'react';
import Icon from '@ant-design/icons';
import { Input, message } from 'antd';
import classnames from 'classnames';
import { WordMarkOptionTypeEnum } from '@/isomorphic/constants';
import { BACKGROUND_EVENTS } from '@/events';
import Chrome from '@/core/chrome';
import { CloseOutlined } from '@ant-design/icons';
import NoteLogoSvg from '@/assets/svg/note-logo.svg';
import CopySvg from '@/assets/svg/copy.svg';
import { IKernelEditorRef } from '@/components/lake-editor/kernel-editor';
import { toolbars } from '../constants';
import { saveToNote } from '../util';
import styles from './index.module.less';

interface WordMarkPanelProps {
  selectText: string;
  type: WordMarkOptionTypeEnum;
  closeWordMark: () => void;
  editorRef: React.MutableRefObject<IKernelEditorRef>;
}

enum StepMessage {
  onStart = '雀雀正在快马加鞭生成中…',
}

function WordMarkPanel(props: WordMarkPanelProps) {
  const { selectText, type: defaultType, closeWordMark } = props;
  const [ result, setResult ] = useState(StepMessage.onStart);
  const [ type, setType ] = useState(defaultType);
  const [ loading, setLoading ] = useState(true);
  const handClick = (type: WordMarkOptionTypeEnum) => {
    setType(type);
  };

  const onCopyText = async () => {
    await navigator.clipboard.writeText(result);
    message.success(__i18n('复制成功'));
  };

  const onSave = async () => {
    saveToNote(result);
  };

  const executeCommand = () => {
    setLoading(true);
    setResult(StepMessage.onStart);
    Chrome.runtime.sendMessage(
      {
        action: BACKGROUND_EVENTS.WORD_MARK_EXECUTE_COMMAND,
        data: {
          type: type,
          selectText: selectText,
        }
      },
      res => {
        const { data } = res;
        setResult(data.join(''));
      },
    );
  };

  useEffect(() => {
    executeCommand();
  }, [ type ]);

  useEffect(() => {
    setType(defaultType);
  }, [ defaultType ]);

  return (
    <div className={styles.panelWrapper}>
      <div className={styles.execCommandWrapper}>
        {toolbars.map(item => {
          if ([ WordMarkOptionTypeEnum.clipping ].includes(item.type)) {
            return null;
          }
          return (
            <div
              key={item.type}
              onClick={() => handClick(item.type)}
              className={classnames(styles.item, {
                [styles.selectItem]: type === item.type,
              })}
            >
              <Icon component={item.icon} className={styles.icon} />
              <span>{item.name}</span>
            </div>
          );
        })}
      </div>
      <div className={styles.resultWrapper}>
        <div className={styles.resultHeader}>
          <span>{__i18n('结果')}</span>
        </div>
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 24 }}
          className={styles.resultBody}
          disabled
          value={result}
        />
        <div className={styles.resultFooter}>
          <div className={styles.feedbackOperate}>
            <div className={styles.feedbackOperateItem}>{__i18n('👍🏻 有用')}</div>
            <div className={styles.feedbackOperateItem}>{__i18n('👎🏻 没用')}</div>
          </div>
          <div className={styles.saveOperate}>
            <div className={styles.saveOperateItem} onClick={onSave}>
              <Icon component={NoteLogoSvg} />
            </div>
            <div className={styles.line} />
            <div className={styles.saveOperateItem} onClick={onCopyText}>
              <Icon component={CopySvg} />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.closWrapper} onClick={closeWordMark}>
        <CloseOutlined />
      </div>
    </div>
  );
}

export default React.memo(WordMarkPanel);
