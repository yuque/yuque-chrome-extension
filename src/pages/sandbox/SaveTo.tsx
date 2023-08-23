import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { ConfigProvider, Button, Select, message, Menu, Spin } from 'antd';
import classnames from 'classnames';
import { noteProxy } from '@/core/proxy/note';
import type { MenuInfo } from 'rc-menu/lib/interface';
import { urlOrFileUpload } from '@/core/html-parser';
import LinkHelper from '@/core/link-helper';
import LakeEditor, { IEditorRef } from '@/components/lake-editor/editor';
import { GLOBAL_EVENTS } from '@/events';
import { EditorValueContext } from './EditorValueContext';
import styles from './SaveTo.module.less';
import { ActionListener } from '@/core/action-listener';
import BookWithIcon from '@/components/common/book-with-icon';
import { extractSummaryRaw } from '@/components/editor/extract-summary-raw';
import { VIEW_MORE_TAG } from '@/isomorphic/constants';
import NoteTag from '@/components/sandbox/note-tag';
import {
  getSelectTag,
  saveSelectTag,
} from '@/components/sandbox/note-tag/util';
import { docProxy } from '@/core/proxy/doc';
import { mineProxy } from '@/core/proxy/mine';
import {
  getBookmarkHTMLs,
  getBookmarkHtml,
  getCitation,
  getCurrentTab,
  startSelect,
} from './helper';
import {
  SELECT_TYPES,
  SELECT_TYPE_AREA,
  SELECT_TYPE_BOOKMARK,
  SELECT_TYPE_SELECTION,
} from './constants/select-types';

const NODE_DATA_ID = 0;

const BOOKS_DATA = [
  {
    id: NODE_DATA_ID,
    type: 'note',
    get name() {
      return __i18n('小记');
    },
  },
];

export interface ISaveToProps {
  className?: string;
}

const useViewModel = (props: ISaveToProps) => {
  const [ loading, setLoading ] = useState(false);
  const [ editorLoading, setEditorLoading ] = useState(false);
  const [ books, setBooks ] = useState(BOOKS_DATA);
  const [ currentBookId, setCurrentBookId ] = useState(NODE_DATA_ID);
  const { currentType, setCurrentType } = useContext(EditorValueContext);

  const editorRef = useRef<IEditorRef>(null);

  /**
   * 获取知识库的数据
   */
  useEffect(() => {
    mineProxy.getBooks().then(bookList => {
      setBooks([ ...BOOKS_DATA, ...bookList ]);
    });
  }, []);

  /**
   * 对新选取的内容做出响应
   */
  useEffect(() => {
    return ActionListener.addListener(async request => {
      switch (request.action) {
        case GLOBAL_EVENTS.GET_SELECTED_HTML: {
          const { HTMLs } = request;
          setEditorLoading(true);
          try {
            const isEmpty = editorRef.current.isEmpty();
            // 判断当前文档是否是空的
            // 如果是空的则插入初始内容
            if (isEmpty) {
              const isNote = currentBookId === NODE_DATA_ID;
              const { heading, quote } = getBookmarkHTMLs(
                await getCurrentTab(),
              );
              editorRef.current?.appendContent(quote);
              // 回到文档开头
              editorRef.current?.focusToStart();
              // 非小记插入标题
              if (!isNote) {
                editorRef.current?.appendContent(heading);
                editorRef.current?.focusToStart(1);
              }
            }
            // 追加当前选取的html
            editorRef.current?.appendContent(HTMLs.join(''));
          } finally {
            setEditorLoading(false);
          }
          return;
        }
        default:
          break;
      }
    });
  }, [ currentBookId ]);

  /**
   * 监听currentType的变化，做出不同的响应
   */
  useEffect(() => {
    if (currentType === SELECT_TYPE_AREA) {
      // 重新开始剪藏的时候需要清空内容
      editorRef.current?.setContent('');
      startSelect();
    } else if (currentType === SELECT_TYPE_BOOKMARK) {
      // 选择了剪藏了网址，将编辑器的内容设置成bookmark
      getCurrentTab().then(tab => {
        const html = getBookmarkHtml(tab);
        editorRef.current?.setContent(html);
      });
    }
  }, [ currentType ]);

  /**
   * 文档加载成功后根据currentType做出不同的内容初始化
   */
  const onLoad = useCallback(() => {
    if (!editorRef.current) return;

    if (currentType === SELECT_TYPE_SELECTION) {
      // 如果使用的是右键剪藏 则插入对应的内容
      const HTMLs = ActionListener.getSelectHTMLs();
      (async () => {
        setEditorLoading(true);
        try {
          editorRef.current?.appendContent(HTMLs.join(''));
          editorRef.current?.appendContent(
            getCitation(await getCurrentTab()),
            true,
          );
        } finally {
          setEditorLoading(false);
        }
      })();
    } else if (currentType === SELECT_TYPE_BOOKMARK) {
      // 如果选择的是剪藏网址则插入bookmark
      getCurrentTab().then(tab => {
        const html = getBookmarkHtml(tab);
        editorRef.current?.setContent(html);
      });
    }
  }, [ currentType ]);

  const onSave = useCallback(async () => {
    if (!editorRef.current) return;

    const onSuccess = (type: 'doc' | 'note', noteOrDoc: { id: string }) => {
      setCurrentType(null);
      setLoading(false);
      setEditorLoading(false);

      if (type === 'note') {
        const url = LinkHelper.goMyNote();
        message.success(
          <span>
            {__i18n('保存成功！')}
            &nbsp;&nbsp;
            <a target="_blank" href={url}>
              {__i18n('去小记查看')}
            </a>
          </span>,
        );
      } else {
        const url = LinkHelper.goDoc(noteOrDoc);
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
    };

    const onError = () => {
      message.error(__i18n('保存失败，请重试！'));
      setLoading(false);
      setEditorLoading(false);
    };

    setLoading(true);
    setEditorLoading(true);

    try {
      const serializedAsiContent = await editorRef.current?.getContent('lake') || '';
      const serializedHtmlContent = await editorRef.current?.getContent('text/html') || '';
      const summary = editorRef.current.getSummaryContent();
      const wordCount = editorRef.current.wordCount();
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
      if (currentBookId === NODE_DATA_ID) {
        const tagIds = await getSelectTag();
        noteProxy
          .create({
            source: serializedAsiContent,
            html: serializedHtmlContent,
            abstract: description,
            has_image,
            has_bookmark,
            has_attachment,
            word_count: wordCount,
            tag_meta_ids: tagIds,
          })
          .then(data => {
            onSuccess('note', data);
            saveSelectTag([]);
          })
          .catch(onError);
      } else {
        getCurrentTab().then(tab => {
          docProxy
            .create({
              title: __i18n('[来自剪藏] {title}', {
                title: tab.title,
              }),
              book_id: currentBookId,
              body_draft_asl: serializedAsiContent,
              body_asl: serializedAsiContent,
              body: serializedHtmlContent,
              insert_to_catalog: true,
            })
            .then(doc => {
              onSuccess('doc', doc);
            })
            .catch(onError);
        });
      }
    } catch (e) {
      message.error(__i18n('保存失败，请重试！'));
      setLoading(false);
      setEditorLoading(false);
    }
  }, [ editorRef, currentBookId ]);

  const onUploadImage = useCallback(async (params: { data: string }) => {
    return urlOrFileUpload(params.data);
  }, []);

  return {
    state: {
      books,
      currentBookId,
      currentType,
      loading,
      editorRef,
      editorLoading,
    },
    onSave,
    onLoad,
    onUploadImage,
    onContinue: startSelect,
    onSelectType: setCurrentType,
    onSelectBookId: setCurrentBookId,
  };
};

export default function SaveTo(props: ISaveToProps) {
  const { currentType } = useContext(EditorValueContext);
  const {
    state: { books, currentBookId, loading, editorRef, editorLoading },
    onSave,
    onLoad,
    onContinue,
    onSelectType,
    onUploadImage,
    onSelectBookId,
  } = useViewModel(props);

  const handleTypeSelect = useCallback((info: MenuInfo) => {
    onSelectType(info.key);
  }, []);

  const SELECT_MENU_DATA = useMemo(
    () =>
      SELECT_TYPES.map(item => ({
        key: item.key,
        icon: item.icon,
        label: item.text,
      })),
    [],
  );

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            activeBarBorderWidth: 0,
            itemMarginInline: 0,
          },
        },
      }}
    >
      <div className={classnames(styles.wrapper, props.className)}>
        <div className={styles.actionTip}>
          {__i18n('选择剪藏方式')}
        </div>
        <Menu
          mode="inline"
          inlineIndent={8}
          activeKey={currentType}
          onClick={handleTypeSelect}
          items={SELECT_MENU_DATA}
        />
        <div className={classnames(styles.actionTip, styles.clipTarget)}>
          {__i18n('剪藏到')}
        </div>
        <Select<number>
          className={styles.list}
          onChange={(value: number) => onSelectBookId(Number(value))}
          defaultValue={currentBookId}
          options={books.map(book => ({
            value: book.id,
            label: <BookWithIcon book={book} />,
          }))}
        />
        <Button
          className={styles.button}
          type="primary"
          block
          loading={loading}
          disabled={!currentType}
          onClick={onSave}
        >
          {__i18n('保存到')}
          {currentBookId === NODE_DATA_ID ? __i18n('小记') : __i18n('知识库')}
        </Button>
        {currentType && (
          <div className={styles['lake-editor']}>
            {editorLoading ? (
              <Spin className={styles.loading} spinning />
            ) : null}
            <LakeEditor
              ref={editorRef}
              value=""
              onLoad={onLoad}
              onSave={onSave}
              uploadImage={onUploadImage}
            >
              <Button onClick={onContinue}>
                {__i18n('继续选取')}
              </Button>
            </LakeEditor>
            <div
              className={classnames({
                [styles.hidden]: currentBookId !== NODE_DATA_ID,
              })}
            >
              <NoteTag />
            </div>
          </div>
        )}
      </div>
    </ConfigProvider>
  );
}
