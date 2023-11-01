import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from 'react';
import { message } from 'antd';
import classnames from 'classnames';
import LinkHelper from '@/isomorphic/link-helper';
import { backgroundBridge } from '@/core/bridge/background';
import { WordMarkOptionTypeEnum } from '@/isomorphic/constants';
import { useForceUpdate } from '@/hooks/useForceUpdate';
import { ClipAssistantMessageActions } from '@/isomorphic/event/clipAssistant';
import {
  buildParamsForDoc,
  buildParamsForNote,
} from '@/components/lake-editor/helper';
import { useWordMarkContext } from '@/components/WordMarkLayout/useWordMarkContext';
import Editor, { IEditorRef } from './Editor';
import Panel from './Panel';
import Inner from './Inner';
import styles from './app.module.less';

function WordMarkApp() {
  const [type, setType] = useState<WordMarkOptionTypeEnum | null>(null);
  const [selectText, setSelectText] = useState<string>('');
  const { forceUpdate } = useForceUpdate();
  const showWordMarkRef = useRef(false);
  const editorRef = useRef<IEditorRef>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const wordMarkPositionRef = useRef({
    left: 0,
    top: 0,
  });
  const mouseupPositionRef = useRef({ x: 0, y: 0 });
  const isSaving = useRef(false);
  const wordMarkContext = useWordMarkContext();
  const [visible, setVisible] = useState(false);

  const save = useCallback(
    async (text: string) => {
      if (wordMarkContext.evokePanelWhenClip) {
        // 展开侧边栏
        window._yuque_ext_app.showSidePanel();
        // 发送消息在编辑器内加入内容
        window._yuque_ext_app?.sendMessageToClipAssistant(
          ClipAssistantMessageActions.addContent,
          text,
        );
        showWordMarkRef.current = false;
        forceUpdate();
        return;
      }
      if (isSaving.current) {
        return;
      }
      try {
        isSaving.current = true;
        const editor = editorRef.current;
        if (!wordMarkContext.defaultSavePosition.id) {
          // 保存到小记
          const noteParams = {
            ...(await buildParamsForNote(editor as any)),
          };
          await backgroundBridge.request.note.create(noteParams);
          const url = LinkHelper.goMyNote();
          message.success(
            <span>
              {__i18n('保存成功！')}
              &nbsp;&nbsp;
              <a target="_blank" href={url} className={styles.link}>
                {__i18n('去小记查看')}
              </a>
            </span>,
          );
        } else {
          // 保存到知识库
          const tab = await backgroundBridge.tab.getCurrent();
          const docParams = {
            ...(await buildParamsForDoc(editor as any)),
            title: __i18n('[来自剪藏] {title}', {
              title: tab?.title || '',
            }),
            book_id: wordMarkContext.defaultSavePosition.id,
          };
          const doc = await backgroundBridge.request.doc.create(docParams);
          const url = LinkHelper.goDoc(doc);
          message.success(
            <span>
              {__i18n('保存成功！')}
              &nbsp;&nbsp;
              <a target="_blank" href={url}>
                {__i18n('立即查看')}
              </a>
            </span>,
          );
        }
        showWordMarkRef.current = false;
        forceUpdate();
      } catch (e) {
        message.error(__i18n('保存失败，请重试！'));
      }
      isSaving.current = false;
    },
    [wordMarkContext],
  );

  const executeCommand = useCallback(
    async (t: WordMarkOptionTypeEnum) => {
      if (t === WordMarkOptionTypeEnum.clipping) {
        const selection = window.getSelection();
        let html = '';
        if (selection) {
          html = Array.from(selection.getRangeAt(0).cloneContents().childNodes)
            .map((v: any) => v?.outerHTML || v?.nodeValue)
            .join('');
        }
        await editorRef.current?.setContent(
          `${html}<blockquote><p>来自: <a href="${window.location.href}">${document.title}</a></p></blockquote>`,
          'text/html',
        );
        await save(html);
        return;
      }
      setType(t);
    },
    [selectText, save],
  );

  const initPosition = useCallback(() => {
    const width = wrapperRef.current?.offsetWidth || 0;
    const height = wrapperRef.current?.offsetHeight || 0;
    const left = mouseupPositionRef.current.x - width / 2;
    const top = mouseupPositionRef.current.y + window.scrollY + 26;
    const maxLeft = document.body.clientWidth - width;
    const maxTop = window.innerHeight + window.scrollY - height - 28;
    wordMarkPositionRef.current = {
      left: Math.min(Math.max(left, 0), maxLeft),
      top: Math.min(Math.max(top, 0), maxTop),
    };
    forceUpdate();
  }, []);

  const closeWordMark = useCallback(() => {
    showWordMarkRef.current = false;
    forceUpdate();
  }, []);

  useEffect(() => {
    const getIsEditing = () => {
      const element = document.activeElement;
      if (!element) {
        return false;
      }
      if (['INPUT', 'TEXTAREA'].includes(element.tagName)) {
        return true;
      }
      return element.getAttribute('contenteditable') === 'true';
    };

    const onMouseUp = (e: MouseEvent) => {
      setTimeout(() => {
        const isEdit = getIsEditing();
        const selection = window.getSelection();
        // 如果选中区域可编辑，那么不展示划词
        if (isEdit || !selection) {
          showWordMarkRef.current = false;
          setVisible(false);
          forceUpdate();
          return;
        }
        const selectionText = selection.toString();
        if (selection.rangeCount <= 0) {
          showWordMarkRef.current = false;
          setVisible(false);
          forceUpdate();
          return;
        }
        if (!selectionText.trim().length) {
          showWordMarkRef.current = false;
          setVisible(false);
          forceUpdate();
          return;
        }
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const x = (rect.left + rect.right) / 2;
        const y = rect.bottom;
        showWordMarkRef.current = true;
        forceUpdate();
        setSelectText(selectionText);
        mouseupPositionRef.current = {
          x,
          y,
        };
      }, 10);
    };

    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  useEffect(() => {
    setType(null);
  }, [selectText, showWordMarkRef.current]);

  useLayoutEffect(() => {
    if (!selectText) {
      return;
    }
    initPosition();
  }, [selectText, initPosition, type]);

  useEffect(() => {
    setVisible(wordMarkContext.enable);
    // 不存在修饰键时不监听键盘事件
    if (!wordMarkContext.evokeWordMarkShortKey) {
      return;
    }
    const onkeydown = (e: KeyboardEvent) => {
      if (
        e.key === wordMarkContext.evokeWordMarkShortKey &&
        showWordMarkRef.current
      ) {
        setVisible(v => !v);
      }
    };
    window.addEventListener('keydown', onkeydown);

    return () => {
      window.removeEventListener('keydown', onkeydown);
    };
  }, [wordMarkContext]);

  return (
    <div
      className={styles.wrapper}
      style={(visible || wordMarkContext.enable) ? {} : { display: 'none' }}
    >
      <div
        style={{
          left: `${wordMarkPositionRef.current.left}px`,
          top: `${wordMarkPositionRef.current.top}px`,
        }}
        className={classnames(styles.wordMarkWrapper, {
          [styles.hidden]: !showWordMarkRef.current,
        })}
        onMouseUp={e => {
          // 内部面板阻止冒泡，避免触发 mouseup 事件
          e.stopPropagation();
        }}
        ref={wrapperRef}
      >
        {type ? (
          <Panel
            selectText={selectText}
            type={type}
            closeWordMark={closeWordMark}
            editorRef={editorRef}
            save={save}
          />
        ) : (
          <Inner executeCommand={executeCommand} />
        )}
      </div>
      <Editor ref={editorRef} />
    </div>
  );
}

export default WordMarkApp;
