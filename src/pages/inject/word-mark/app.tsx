import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  useContext,
} from 'react';
import { ConfigProvider, message } from 'antd';
import classnames from 'classnames';
import { VIEW_MORE_TAG, WordMarkOptionTypeEnum } from '@/isomorphic/constants';
import { __i18n } from '@/isomorphic/i18n';
import { extractSummaryRaw } from '@/components/editor/extract-summary-raw';
import { WordMarkContext } from '@/context/word-mark-context';
import { SandBoxMessageType, ClippingTypeEnum } from '@/isomorphic/sandbox';
import { sendMessageToSandBox } from '@/core/bridge/sendMessageToSandbox';
import { useForceUpdate } from '@/hooks/useForceUpdate';
import { saveToNote, saveToBook } from './util';
import WordMarkPanel from './word-mark-panel';
import InnerWordMark from './inner-word-mark';
import Editor, { IEditorRef } from './editor';
import styles from './app.module.less';

export enum WordMarkType {
  /**
   * 行内模式
   */
  inner = 'inner',

  /**
   * 面板模式
   */
  panel = 'panel',
}

function App() {
  const [showWordMark, setShowWordMark] = useState(false);
  const [type, setType] = useState<WordMarkOptionTypeEnum | null>(null);
  const [selectText, setSelectText] = useState<string>('');
  const { forceUpdate } = useForceUpdate();
  const editorRef = useRef<IEditorRef>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const wordMarkPositionRef = useRef({
    left: 0,
    top: 0,
  });
  const mouseupPositionRef = useRef({ x: 0, y: 0 });
  const isSaving = useRef(false);

  const wordMarkContext = useContext(WordMarkContext);

  const save = useCallback(
    async (text: string) => {
      if (wordMarkContext.evokePanelWhenClip) {
        sendMessageToSandBox(SandBoxMessageType.getSelectedHtml, {
          HTMLs: [text],
          type: ClippingTypeEnum.area,
        });
        setShowWordMark(false);
        return;
      }
      if (isSaving.current) {
        return;
      }
      try {
        isSaving.current = true;
        const serializedAsiContent =
          (await editorRef.current?.getContent('lake')) || '';
        const serializedHtmlContent =
          (await editorRef.current?.getContent('text/html')) || '';
        const summary = await editorRef.current?.getSummaryContent();
        const wordCount = await editorRef.current?.wordCount();
        const extractRes = extractSummaryRaw(serializedAsiContent, {
          summary,
        });
        const {
          hasImage: has_image,
          hasBookmark: has_bookmark,
          hasAttachment: has_attachment,
          isFull,
        } = extractRes;
        let description = extractRes.html;
        // 摘要与内容不相等，展示更多标记
        if (!isFull) {
          description += VIEW_MORE_TAG;
        }
        // 存到小记
        if (wordMarkContext.defaultSavePosition.id === 0) {
          await saveToNote({
            has_attachment,
            has_bookmark,
            has_image,
            source: serializedAsiContent,
            html: serializedHtmlContent,
            abstract: description,
            word_count: wordCount,
          });
        } else {
          await saveToBook({
            book_id: wordMarkContext.defaultSavePosition.id,
            body_draft_asl: serializedAsiContent,
            body_asl: serializedAsiContent,
            body: serializedHtmlContent,
          });
        }
        setShowWordMark(false);
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
        const selection = document.getSelection();
        let html = '';
        if (selection) {
          html = Array.from(selection.getRangeAt(0).cloneContents().childNodes)
            .map((v: any) => v?.outerHTML || v?.nodeValue)
            .join('');
        }
        await editorRef.current?.setContent(
          `${html}<p><br></p><blockquote><p>来自: <a href="${window.location.href}">${document.title}</a></p></blockquote>`,
          'text/html',
        );
        await save(html);
        return;
      }
      setType(t);
    },
    [selectText],
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
    setShowWordMark(false);
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
          setShowWordMark(false);
          return;
        }
        const selectionText = selection.toString();
        if (selection.rangeCount <= 0) {
          setShowWordMark(false);
          return;
        }
        if (!selectionText.trim().length) {
          setShowWordMark(false);
          return;
        }
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const x = (rect.left + rect.right) / 2;
        const y = rect.bottom;
        setShowWordMark(true);
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
  }, [selectText, showWordMark]);

  useLayoutEffect(() => {
    if (!selectText) {
      return;
    }
    initPosition();
  }, [selectText, initPosition, type]);

  return (
    <ConfigProvider prefixCls="yq-word-mark">
      <div>
        <div
          style={{
            left: `${wordMarkPositionRef.current.left}px`,
            top: `${wordMarkPositionRef.current.top}px`,
          }}
          className={classnames(styles.wordMarkWrapper, {
            [styles.hidden]: !showWordMark,
          })}
          onMouseUp={e => {
            // 内部面板阻止冒泡，避免触发 mouseup 事件
            e.stopPropagation();
          }}
          ref={wrapperRef}
        >
          {type ? (
            <WordMarkPanel
              selectText={selectText}
              type={type}
              closeWordMark={closeWordMark}
              editorRef={editorRef}
              save={save}
            />
          ) : (
            <InnerWordMark executeCommand={executeCommand} />
          )}
        </div>
        <Editor ref={editorRef} />
      </div>
    </ConfigProvider>
  );
}

export default App;
