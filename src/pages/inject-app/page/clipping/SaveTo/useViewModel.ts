import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { message } from 'antd';
import { urlOrFileUpload } from '@/core/html-parser';
import { BACKGROUND_EVENTS } from '@/events';
import { saveToBook, saveToNote } from '@/pages/inject-app/helper/save';
import { sendMessageToBack } from '@/core/bridge/inject-to-background';
import {
  getBookmarkHTMLs,
  getBookmarkHtml,
} from '@/pages/inject-app/helper/editor';
import {
  SELECT_TYPE_AREA,
  SELECT_TYPE_BOOKMARK,
} from '@/pages/inject-app/constants/select-types';
import { InjectAppContext } from '@/context/inject-app-context';
import eventManager from '@/core/event/eventManager';
import { AppEvents } from '@/core/event/events';
import useAsyncEffect from '@/hooks/useAsyncEffect';
import { INoteTagRef } from '@/components/note-tag';

const NODE_DATA_ID = 0;

const BOOKS_DATA = [
  {
    id: NODE_DATA_ID,
    type: 'Note',
    get name() {
      return __i18n('小记');
    },
  },
];

export const useViewModel = () => {
  const { editorRef, startSelect, defaultClipType } =
    useContext(InjectAppContext);
  const noteTagRef = useRef<INoteTagRef>();
  const [ loading, setLoading ] = useState(false);
  const [ books, setBooks ] = useState(BOOKS_DATA);
  const [ currentBookId, setCurrentBookId ] = useState(NODE_DATA_ID);
  const [ currentType, setCurrentType ] = useState<any>(defaultClipType);
  const areaSelectRef = useRef('');

  useEffect(() => {
    if (!currentType) {
      return editorRef.current.hiddenIframe();
    }
    editorRef.current.showIframe();
  }, [ currentType ]);

  /**
   * 获取知识库的数据
   */
  useEffect(() => {
    sendMessageToBack(BACKGROUND_EVENTS.GET_MINE_BOOK).then(res => {
      setBooks([ ...BOOKS_DATA, ...res ]);
    });
  }, []);

  /**
   * 对新选取的内容做出响应
   */
  useEffect(() => {
    const onSelect = async (data: { HTMLs: Array<string> }) => {
      const { HTMLs } = data;
      editorRef.current.showIframe();
      const isEmpty = await editorRef.current.isEmpty();
      // 判断当前文档是否是空的
      // 如果是空的则插入初始内容
      if (isEmpty) {
        const isNote = currentBookId === NODE_DATA_ID;
        const { heading, quote } = getBookmarkHTMLs();
        await editorRef.current?.appendContent(quote);
        // 回到文档开头
        await editorRef.current?.focusToStart();
        // 非小记插入标题
        if (!isNote) {
          await editorRef.current?.appendContent(heading);
          await editorRef.current?.focusToStart(1);
        }
      }
      // 追加当前选取的html
      await editorRef.current?.appendContent(HTMLs.join(''));
    };
    eventManager.listen(AppEvents.GET_SELECTED_HTML, onSelect);
    return () => {
      eventManager.removeListener(AppEvents.GET_SELECTED_HTML, onSelect);
    };
  }, [ currentBookId ]);

  /**
   * 监听currentType的变化，做出不同的响应
   */
  useAsyncEffect(async () => {
    if (currentType === SELECT_TYPE_AREA) {
      // 重新开始剪藏的时候需要清空内容
      await editorRef.current?.setContent(
        areaSelectRef.current || '',
        'text/lake',
      );
      if (!areaSelectRef.current) {
        startSelect();
      }
      // 清空记录上一次的剪藏内容
      areaSelectRef.current = '';
    } else if (currentType === SELECT_TYPE_BOOKMARK) {
      // 选择了剪藏了网址，将编辑器的内容设置成bookmark
      // 并存储上一次剪藏的内容
      const content = await editorRef.current.getContent('lake');
      areaSelectRef.current = content || '';
      const html = getBookmarkHtml();
      await editorRef.current.setContent(html);
    }
  }, [ currentType ]);

  const onSave = useCallback(async () => {
    if (!editorRef.current) return;
    setLoading(true);
    try {
      if (currentBookId === NODE_DATA_ID) {
        const noteIds = await noteTagRef.current?.getSelectTagIds();
        await saveToNote(editorRef.current, noteIds, { needThrowError: true });
        noteTagRef.current.clear();
      } else {
        await saveToBook(editorRef.current, currentBookId, {
          needThrowError: true,
        });
      }
      setCurrentType(null);
    } catch (e) {
      message.error(__i18n('保存失败，请重试！'));
    } finally {
      setLoading(false);
    }
  }, [ currentBookId ]);

  useEffect(() => {
    const onMessage = (e: MessageEvent<any>) => {
      if (e?.data?.action === 'yq-save') {
        onSave();
      }
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, [ onSave ]);

  const onUploadImage = useCallback(async (params: { data: string }) => {
    return urlOrFileUpload(params.data);
  }, []);

  return {
    state: {
      books,
      currentBookId,
      currentType,
      noteTagRef,
      loading,
    },
    onSave,
    onUploadImage,
    onSelectType: setCurrentType,
    onSelectBookId: setCurrentBookId,
  };
};
