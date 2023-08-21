import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from 'react';
import classnames from 'classnames';
import { WordMarkOptionTypeEnum } from '@/isomorphic/constants';
import KernelEditor, {
  IKernelEditorRef,
} from '@/components/lake-editor/kernel-editor';
import WordMarkPanel from './word-mark-panel';
import InnerWordMark from './inner-word-mark';
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
  const [ showWordMark, setShowWordMark ] = useState(false);
  const [ type, setType ] = useState<WordMarkOptionTypeEnum>(null);
  const [ selectText, setSelectText ] = useState<string>('');
  const [ _, forceUpdate ] = useState(0);
  const editorRef = useRef<IKernelEditorRef>();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const wordMarkPositionRef = useRef({
    left: 0,
    top: 0,
  });

  const executeCommand = useCallback(
    async (type: WordMarkOptionTypeEnum) => {
      if (type === WordMarkOptionTypeEnum.clipping) {
        const html = Array.from(
          document.getSelection().getRangeAt(0).cloneContents().childNodes,
        )
          .map(v => v.outerHTML)
          .join('');
        editorRef.current?.setContent('text/html', html);
        console.log(await editorRef.current?.getContent('lake'));
        // saveToNote(selectText);
        return;
      }
      setType(type);
    },
    [ selectText ],
  );

  const initPosition = useCallback(() => {
    const selection = window.getSelection();
    const selectionText = selection.toString();
    if (selection.rangeCount <= 0) {
      return;
    }
    const range = selection.getRangeAt(0);
    if (!selectionText.trim()) {
      setShowWordMark(false);
      return;
    }
    const rect = range.getBoundingClientRect();
    const width = wrapperRef.current?.offsetWidth || 0;
    const height = wrapperRef.current?.offsetHeight || 0;
    const left = rect.left + width / 2;
    const top = rect.bottom + window.scrollY + 16;
    const maxLeft = document.body.clientWidth - width;
    const maxTop = window.innerHeight + window.scrollY - height;
    console.log(width, height, left, top, maxLeft, maxTop);
    wordMarkPositionRef.current = {
      left: Math.min(Math.max(left, 0), maxLeft),
      top: Math.min(Math.max(top, 0), maxTop),
    };
    setShowWordMark(true);
    setSelectText(selectionText);
    forceUpdate(state => state + 1);
  }, []);

  const closeWordMark = useCallback(() => {
    setShowWordMark(false);
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', initPosition);
    return () => {
      document.removeEventListener('selectionchange', initPosition);
    };
  }, [ initPosition ]);

  useEffect(() => {
    setType(null);
  }, [ selectText ]);

  useLayoutEffect(() => {
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
          />
        ) : (
          <InnerWordMark
            executeCommand={executeCommand}
            editorRef={editorRef}
          />
        )}
      </div>
      <div style={{ display: 'none' }}>
        <KernelEditor ref={editorRef} value="" onLoad={() => {
          console.info('loaded, -----------');
          editorRef.current?.setContent('text/html', '<p>hello world</p>').then(() => {
            editorRef.current.getContent('lake').then(console.log);
          });
          console.info('editor', editorRef.current);
        }} />
      </div>
    </div>
  );
}

export default App;
