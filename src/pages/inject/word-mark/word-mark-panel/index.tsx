import React, { useState, useEffect } from 'react';
import Icon from '@ant-design/icons';
import { Input, message, Tooltip } from 'antd';
import classnames from 'classnames';
import { WordMarkOptionTypeEnum } from '@/isomorphic/constants';
import { i18n } from '@/isomorphic/i18n';
import { BACKGROUND_EVENTS } from '@/events';
import Chrome from '@/core/chrome';
import { CloseOutlined } from '@ant-design/icons';
import NoteLogoSvg from '@/assets/svg/note-logo.svg';
import CopySvg from '@/assets/svg/copy.svg';
import { IKernelEditorRef } from '@/components/lake-editor/kernel-editor';
import { toolbars } from '../constants';
import styles from './index.module.less';

interface WordMarkPanelProps {
  selectText: string;
  type: WordMarkOptionTypeEnum;
  closeWordMark: () => void;
  editorRef: React.MutableRefObject<IKernelEditorRef>;
  save: () => void;
}

enum StepMessage {
  onStart = '雀雀正在快马加鞭翻译中…',
}

function WordMarkPanel(props: WordMarkPanelProps) {
  const {
    selectText,
    type: defaultType,
    closeWordMark,
    save,
    editorRef,
  } = props;
  const [ result, setResult ] = useState<string>(StepMessage.onStart);
  const [ type, setType ] = useState(defaultType);
  const [ loading, setLoading ] = useState(true);
  const handClick = (t: WordMarkOptionTypeEnum) => {
    setType(t);
  };

  const onSave = async () => {
    await editorRef.current?.setContent('text/html', result);
    save();
  };

  const onCopyText = async () => {
    await navigator.clipboard.writeText(result);
    message.success(i18n('复制成功'));
  };

  const executeCommand = () => {
    setLoading(true);
    setResult(StepMessage.onStart);
    Chrome.runtime.sendMessage(
      {
        action: BACKGROUND_EVENTS.WORD_MARK_EXECUTE_COMMAND,
        data: {
          type,
          selectText,
        },
      },
      res => {
        const { data } = res;
        setResult(data.join(''));
        setLoading(false);
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
        {!loading && (
          <div className={styles.resultFooter}>
            <div className={styles.feedbackOperate} />
            <div className={styles.saveOperate}>
              <Tooltip
                title={i18n('保存到小记')}
                trigger="hover"
                placement="bottom"
                getPopupContainer={node => node.parentElement}
                mouseEnterDelay={0.5}
              >
                <div className={styles.saveOperateItem} onClick={onSave}>
                  <Icon component={NoteLogoSvg} />
                </div>
              </Tooltip>
              <div className={styles.line} />
              <Tooltip
                title={i18n('复制到剪切板')}
                trigger="hover"
                placement="bottom"
                getPopupContainer={node => node.parentElement}
                mouseEnterDelay={0.5}
              >
                <div className={styles.saveOperateItem} onClick={onCopyText}>
                  <Icon component={CopySvg} />
                </div>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
      <div className={styles.closWrapper} onClick={closeWordMark}>
        <CloseOutlined />
      </div>
    </div>
  );
}

export default React.memo(WordMarkPanel);
