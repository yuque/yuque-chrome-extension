import React, { useState, useEffect } from 'react';
import { Input, Tooltip } from 'antd';
import classnames from 'classnames';
import LarkIcon from '@/components/LarkIcon';
import { WordMarkOptionTypeEnum } from '@/isomorphic/constant/wordMark';
import { __i18n } from '@/isomorphic/i18n';
import { CloseOutlined } from '@ant-design/icons';
import { backgroundBridge } from '@/core/bridge/background';
import { useWordMarkContext } from '@/components/WordMarkLayout/useWordMarkContext';
import { useInjectContent } from '@/pages/inject/components/InjectLayout';
import { toolbars } from '../constants';
import { IEditorRef } from '../Editor';
import styles from './index.module.less';

interface WordMarkPanelProps {
  selectText: string;
  type: WordMarkOptionTypeEnum;
  closeWordMark: () => void;
  editorRef: React.MutableRefObject<IEditorRef>;
  save: (text: string) => void;
}

const StepMessage = {
  onStart: __i18n('雀雀正在快马加鞭翻译中…'),
};

function WordMarkPanel(props: WordMarkPanelProps) {
  const {
    selectText,
    type: defaultType,
    closeWordMark,
    save,
    editorRef,
  } = props;
  const wordMarkContext = useWordMarkContext();
  const [result, setResult] = useState<string>(StepMessage.onStart);
  const [type, setType] = useState(defaultType);
  const [loading, setLoading] = useState(true);
  const { message: apiMessage } = useInjectContent();
  const handClick = (t: WordMarkOptionTypeEnum) => {
    setType(t);
  };

  const onSave = async () => {
    await editorRef.current?.setContent(result, 'text/html');
    save(result);
  };

  const onCopyText = async () => {
    await navigator.clipboard.writeText(result);
    apiMessage?.success(__i18n('复制成功'));
  };

  const executeCommand = async () => {
    setLoading(true);
    setResult(StepMessage.onStart);
    const item = toolbars.find(item => item.type === type);
    // 上报一次埋点请求
    if (item?.monitor) {
      backgroundBridge.request.monitor.biz(item.monitor);
    }
    try {
      let text = '';
      if (type === WordMarkOptionTypeEnum.translate) {
        const { result: textResult } =
          await backgroundBridge.request.wordMark.translate(selectText);
        text = textResult;
      }
      setResult(text);
    } catch (error) {
      console.log(error, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeCommand();
  }, [type]);

  useEffect(() => {
    setType(defaultType);
  }, [defaultType]);

  return (
    <div className={styles.panelWrapper}>
      <div className={styles.execCommandWrapper}>
        {toolbars.map(item => {
          if (
            [WordMarkOptionTypeEnum.clipping].includes(item.type) ||
            wordMarkContext.disableFunction.includes(item.id as any)
          ) {
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
              <LarkIcon name={item.icon} className={styles.icon} />
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
                title={__i18n('保存到小记')}
                trigger="hover"
                placement="bottom"
                getPopupContainer={node => node as HTMLElement}
              >
                <div className={styles.saveOperateItem} onClick={onSave}>
                  <LarkIcon name="feather-outlined" />
                </div>
              </Tooltip>
              <div className={styles.line} />
              <Tooltip
                title={__i18n('复制到剪切板')}
                trigger="hover"
                placement="bottom"
                getPopupContainer={node => node.parentElement as HTMLElement}
              >
                <div className={styles.saveOperateItem} onClick={onCopyText}>
                  <LarkIcon name="action-copy" />
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
