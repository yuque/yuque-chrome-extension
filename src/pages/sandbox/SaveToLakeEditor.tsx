import React, { useState, useEffect, useContext, useRef } from 'react';
import { ConfigProvider, Button, Select, message, Menu } from 'antd';
import classnames from 'classnames';
import { get as safeGet } from 'lodash';
import type { MenuInfo } from 'rc-menu/lib/interface';
import Icon, { LinkOutlined } from '@ant-design/icons';
import Chrome from '@/core/chrome';
import proxy from '@/core/proxy';
import processHtmls from '@/core/html-parser';
import LinkHelper from '@/core/link-helper';
import LakeEditor, { IEditorRef } from '@/components/lake-editor/editor';
import { GLOBAL_EVENTS } from '@/events';
import { EditorValueContext } from './EditorValueContext';

import ClipperSvg from '@/assets/svg/clipper.svg';
import BookLogoSvg from '@/assets/svg/book-logo.svg';
import NoteLogoSvg from '@/assets/svg/note-logo.svg';
import styles from './SaveTo.module.less';

type MessageSender = chrome.runtime.MessageSender;

type SendResponse = (response: any) => void;

interface RequestMessage {
  action: keyof typeof GLOBAL_EVENTS;
  htmls?: string[];
}

let editorInstance;

const getBookmarkHtml = (tab: chrome.tabs.Tab) => {
  return `<h2>${tab.title}</h2><p><a href="${tab.url}">${tab.title}</a></p>`;
};

const getCurrentTab = (): Promise<chrome.tabs.Tab> =>
  new Promise(resolve => {
    Chrome.tabs.getCurrent(tab => {
      resolve(tab);
    });
  });

const getNoteId = async (): Promise<string> => {
  const noteStatusResponse = await proxy.note.getStatus();
  const noteId = safeGet(noteStatusResponse, 'data.meta.mirror.id');
  return noteId;
};

const NOTE_DATA = {
  id: 0,
  type: 'note',
  get name() {
    return __i18n('小记');
  },
};

const SELECT_TYPES = [
  {
    key: 'area-select',
    enabled: true,
    get text() {
      return __i18n('剪藏选取的内容');
    },
    icon: <Icon component={ClipperSvg} />,
  },
  {
    key: 'bookmark',
    enabled: true,
    get text() {
      return __i18n('剪藏网址');
    },
    icon: <LinkOutlined />,
  },
];

function BookWithIcon({ book }) {
  const iconSvg = book.type === 'note' ? NoteLogoSvg : BookLogoSvg;
  return (
    <>
      <Icon style={{ marginRight: 4, color: '#888' }} component={iconSvg} />
      {book.name}
    </>
  );
}

const useViewModel = props => {
  const [ books, setBooks ] = useState([ NOTE_DATA ]);
  const [ currentBookId, setCurrentBookId ] = useState(NOTE_DATA.id);
  const editorRef = useRef<IEditorRef>(null);
  const { currentType, setCurrentType } =
    useContext(EditorValueContext);
  const onSelectType = setCurrentType;

  const startSelect = (append = false) => {
    getCurrentTab().then(tab => {
      if (!append) {
        const html = getBookmarkHtml(tab);
        editorRef.current?.setContent(html);
      }
      Chrome.tabs.sendMessage(tab.id, {
        action: GLOBAL_EVENTS.START_SELECT,
      });
    });
  };

  useEffect(() => {
    proxy.book.getBooks()
      .then(bookList => {
        setBooks([ NOTE_DATA, ...bookList ]);
      })
      .catch(e => {
        props.onLogout(e);
      });
  }, []);

  const onReceiveMessage = async (
    request: RequestMessage,
    _sender: MessageSender,
    sendResponse: SendResponse,
  ) => {
    switch (request.action) {
      case GLOBAL_EVENTS.GET_SELECTED_HTML: {
        const { htmls } = request;
        const noteId = await getNoteId();
        const processedHtmls = await processHtmls(htmls, noteId);
        if (editorRef.current.isEmpty()) {
          const initHtml = getBookmarkHtml(await getCurrentTab());
          editorRef.current?.appendContent(initHtml);
        }
        editorRef.current?.appendContent(processedHtmls.join(''), true);
        sendResponse(true);
        return;
      }
      case GLOBAL_EVENTS.GET_SELECTED_TEXT: {
        const { htmls } = request;
        if (editorRef.current.isEmpty()) {
          const initHtml = getBookmarkHtml(await getCurrentTab());
          editorRef.current?.appendContent(initHtml);
        }
        editorRef.current?.appendContent(htmls.join(''), true);
        setCurrentType('selection');
        sendResponse(true);
        return;
      }
      default:
        sendResponse(true);
    }
  };

  useEffect(() => {
    Chrome.runtime.onMessage.addListener(onReceiveMessage);
    return () => {
      Chrome.runtime.onMessage.removeListener(onReceiveMessage);
    };
  }, []);

  useEffect(() => {
    if (currentType === SELECT_TYPES[0].key) {
      startSelect();
    } else if (currentType === SELECT_TYPES[1].key) {
      getCurrentTab().then(tab => {
        const html = getBookmarkHtml(tab);
        editorRef.current?.setContent(html);
      });
    }
  }, [ currentType ]);

  const [ loading, setLoading ] = React.useState<boolean>(false);

  const onSave = () => {
    if (!editorRef.current) return;

    const serializedAsiContent = editorRef.current?.getContent('lake') || '';
    const serializedHtmlContent = editorRef.current?.getContent('text/html') || '';

    const onSuccess = (type: 'doc' | 'note', noteOrDoc: any) => {
      setCurrentType(null);
      setLoading(false);

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
    };

    setLoading(true);
    if (currentBookId === NOTE_DATA.id) {
      proxy.note.getStatus().then(({ data }) => {
        const noteId = safeGet(data, 'meta.mirror.id');
        proxy.note
          .update(noteId, {
            body_asl: serializedAsiContent,
            body_html: serializedHtmlContent,
            description: serializedAsiContent,
          })
          .then(() => {
            onSuccess('note', data);
          })
          .catch(onError);
      });
    } else {
      getCurrentTab().then(tab => {
        proxy.doc
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
  };

  const onContinue = () => {
    startSelect(true);
  };

  const onSelectBookId = setCurrentBookId;

  return {
    state: {
      books,
      currentBookId,
      currentType,
      loading,
      editorRef,
    },
    onSave,
    onContinue,
    onSelectType,
    onSelectBookId,
  };
};

const SaveToLakeEditor = React.forwardRef<IEditorRef, any>((props, ref) => {
  const { currentType } = useContext(EditorValueContext);
  const {
    state: { books, currentBookId, loading, editorRef },
    onSelectBookId,
    onSave,
    onContinue,
    onSelectType,
  } = useViewModel(props);
  const handleTypeSelect = (info: MenuInfo) => {
    onSelectType(info.key);
  };

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
      <div className={styles.wrapper}>
        <div className={styles.actionTip}>
          {__i18n('选择剪藏方式')}
        </div>
        <Menu
          mode="inline"
          inlineIndent={8}
          openKeys={[ currentType ].filter(Boolean)}
          onClick={handleTypeSelect}
          items={SELECT_TYPES.map(item => ({
            key: item.key,
            icon: item.icon,
            label: item.text,
          }))}
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
          {currentBookId === NOTE_DATA.id ? __i18n('小记') : __i18n('知识库')}
        </Button>
        {currentType && (
          <div className={styles['lake-editor']}>
            <LakeEditor ref={editorRef} value="" onChange={html => {
              // console.info(html);
            }}>
              <Button onClick={onContinue}>
                {__i18n('继续选取')}
              </Button>
            </LakeEditor>
          </div>
        )}
      </div>
    </ConfigProvider>
  );
});

export default SaveToLakeEditor;
