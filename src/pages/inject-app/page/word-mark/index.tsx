import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  useContext,
} from 'react';
import classnames from 'classnames';
import { InjectAppType, WordMarkOptionTypeEnum } from '@/isomorphic/constants';
import { __i18n } from '@/isomorphic/i18n';
import { InjectAppContext } from '@/context/inject-app-context';
import { useForceUpdate } from '@/hooks/useForceUpdate';
import { saveToBook, saveToNote } from '@/pages/inject-app/helper/save';
import WordMarkPanel from './word-mark-panel';
import InnerWordMark from './inner-word-mark';
import styles from './index.module.less';

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

function WordMark() {
  const [ showWordMark, setShowWordMark ] = useState(false);
  const [ type, setType ] = useState<WordMarkOptionTypeEnum>(null);
  const [ selectText, setSelectText ] = useState<string>('');
  const { forceUpdate } = useForceUpdate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const wordMarkPositionRef = useRef({
    left: 0,
    top: 0,
  });
  const mouseupPositionRef = useRef({ x: 0, y: 0 });
  const isSaving = useRef(false);

  const { wordMarkConfig, editorRef, updateInjectAppType } =
    useContext(InjectAppContext);

  const save = useCallback(async (text) => {
    if (wordMarkConfig.evokePanelWhenClip) {
      updateInjectAppType(InjectAppType.clipping);
      return;
    }
    if (isSaving.current) {
      return;
    }
    try {
      isSaving.current = true;
      if (wordMarkConfig.defaultSavePosition.id === 0) {
        await saveToNote(editorRef.current, []);
      } else {
        await saveToBook(
          editorRef.current,
          wordMarkConfig.defaultSavePosition.id,
        );
      }
      setShowWordMark(false);
      // 保存完后清空配置
      await editorRef.current.setContent('');
    } catch (error) {}
    isSaving.current = false;
  }, [ wordMarkConfig ]);

  const executeCommand = useCallback(
    async (t: WordMarkOptionTypeEnum) => {
      if (t === WordMarkOptionTypeEnum.clipping) {
        const html = Array.from(
          document.getSelection().getRangeAt(0).cloneContents().childNodes,
        )
          .map((v: any) => v?.outerHTML || v?.nodeValue)
          .join('');

        await editorRef.current?.setContent(
          `${html}<p><br></p><blockquote><p>来自: <a href="${window.location.href}">${document.title}</a></p></blockquote>`,
          'text/html',
        );
        await save(html);
        return;
      }
      setType(t);
    },
    [ selectText ],
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
      if ([ 'INPUT', 'TEXTAREA' ].includes(element.tagName)) {
        return true;
      }
      return element.getAttribute('contenteditable') === 'true';
    };

    const onMouseUp = (e: MouseEvent) => {
      const isEdit = getIsEditing();
      // 如果选中区域可编辑，那么不展示划词
      if (isEdit) {
        setShowWordMark(false);
        return;
      }
      const selection = window.getSelection();
      const selectionText = selection.toString();
      if (selection.rangeCount <= 0) {
        setShowWordMark(false);
        return;
      }
      if (!selectionText.trim().length) {
        setShowWordMark(false);
        return;
      }
      setShowWordMark(true);
      setSelectText(selectionText);
      mouseupPositionRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  useEffect(() => {
    setType(null);
  }, [ selectText, showWordMark ]);

  useLayoutEffect(() => {
    if (!selectText) {
      return;
    }
    initPosition();
  }, [ selectText, initPosition, type ]);

  return (
    <div>
      <div
        style={{
          left: `${wordMarkPositionRef.current.left}px`,
          top: `${wordMarkPositionRef.current.top}px`,
        }}
        className={classnames(styles.wordMarkWrapper, {
          hidden: !showWordMark,
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
            save={save}
          />
        ) : (
          <InnerWordMark executeCommand={executeCommand} />
        )}
      </div>
    </div>
  );
}

export default WordMark;
