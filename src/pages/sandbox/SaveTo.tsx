import React, { useState, useEffect, useContext } from 'react';
import { ConfigProvider, Button, Radio, Select, message, Space, Menu } from 'antd';
import classnames from 'classnames';
import { get as safeGet, isEmpty } from 'lodash';
import Icon, { LinkOutlined, EditFilled, BookFilled } from '@ant-design/icons';
import Chrome from '@/core/chrome';
import proxy from '@/core/proxy';
import processHtmls from '@/core/html-parser';
import LinkHelper from '@/core/link-helper';
import Editor from '@/components/editor/Editor';
import serialize from '@/components/editor/serialize';
import deserialize from '@/components/editor/deserialize';
import formatHTML from '@/components/editor/format-html';
import formatMD from '@/components/editor/format-md';
import contentParser from '@/components/editor/content-parser';
import { GLOBAL_EVENTS } from '@/events';
import styles from './SaveTo.module.less';
import { EditorValueContext } from './EditorValueContext';

import ClipperSvg from '@/assets/svg/clipper.svg';

type MessageSender = chrome.runtime.MessageSender;

type SendResponse = (response: any) => void;

interface RequestMessage {
  action: keyof typeof GLOBAL_EVENTS;
  htmls?: string[];
}

let editorInstance;

const getBookmarkContent = (tab: chrome.tabs.Tab) => {
  return [
    {
      type: 'heading-two',
      reference: true,
      children: [{ text: tab.title }],
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'bookmark-link',
          url: tab.url,
          children: [{ text: tab.title }],
        },
      ],
    },
  ];
};

const getCitation = (tab: chrome.tabs.Tab) => {
  return [
    {
      type: 'paragraph',
      children: [
        {
          text: '来自: ',
        },
        {
          type: 'link',
          url: tab.url,
          children: [
            {
              text: `${tab.url}`,
            },
          ],
        },
      ],
    },
  ];
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

const getPageHTML = (): Promise<string> =>
  new Promise(resolve => {
    getCurrentTab().then(tab => {
      Chrome.tabs.sendMessage(
        tab.id,
        {
          action: GLOBAL_EVENTS.GET_PAGE_HTML,
        },
        html => {
          resolve(html);
        },
      );
    });
  });

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
  const icon = book.type === 'note' ? <EditFilled /> : <BookFilled />;
  return (
    <>
      <span style={{ marginRight: 4, color: '#888' }}>{icon}</span>
      {book.name}
    </>
  );
}

const useViewModel = props => {
  const [books, setBooks] = useState([NOTE_DATA]);
  const [currentBookId, setCurrentBookId] = useState(NOTE_DATA.id);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const { editorValue, currentType, setEditorValue, setCurrentType } =
    useContext(EditorValueContext);
  const onSelectType = setCurrentType;

  const startSelect = (append = false) => {
    getCurrentTab().then(tab => {
      const bookmarkContent = getBookmarkContent(tab);
      if (!append) {
        setEditorValue(bookmarkContent);
      }
      Chrome.tabs.sendMessage(tab.id, {
        action: GLOBAL_EVENTS.START_SELECT,
      });
    });
  };

  useEffect(() => {
    proxy.book.getBooks()
      .then(bookList => {
        setBooks([NOTE_DATA, ...bookList]);
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
        const newHtml = processedHtmls.map(html => formatHTML(html)).join('');
        const document = new window.DOMParser().parseFromString(
          newHtml,
          'text/html',
        );
        const value = deserialize(document.body);
        setEditorValue([...editorValue, ...formatMD(value)]);
        sendResponse(true);
        return;
      }
      case GLOBAL_EVENTS.GET_SELECTED_TEXT: {
        const { htmls } = request;
        const newHtml = htmls.map(html => formatHTML(html)).join('');
        const document = new window.DOMParser().parseFromString(
          newHtml,
          'text/html',
        );

        const value = deserialize(document.body);
        setEditorValue([...editorValue, ...formatMD(value)]);
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
  }, [editorValue]);

  useEffect(() => {
    if (currentType === SELECT_TYPES[0].key) {
      startSelect();
    } else if (currentType === SELECT_TYPES[1].key) {
      getCurrentTab().then(tab => {
        const bookmarkContent = getBookmarkContent(tab);
        setEditorValue(bookmarkContent);
      });
    } else if (currentType === SELECT_TYPES[2]?.key) {
      getPageHTML().then(res => {
        const html = formatHTML(res);
        const document = new window.DOMParser().parseFromString(
          html,
          'text/html',
        );
        const value = deserialize(document.body);
        const formattedValue = formatMD(value);
        setEditorValue(editorValue.concat(formattedValue));
      });
    } else if (currentType === 'selection') {
      getCurrentTab().then(tab => {
        const citation = getCitation(tab);
        setEditorValue(editorValue.concat(citation));
      });
    }
  }, [currentType]);

  useEffect(() => {
    setShowContinueButton(
      currentType === SELECT_TYPES[0].key && !isEmpty(editorValue),
    );
  }, [editorValue, currentType]);

  const onSave = () => {
    if (!editorInstance) return;
    const shouldAddReferenceNode = currentBookId === NOTE_DATA.id;

    const serializedAsiContent = contentParser.wrapLakeAslBody(
      editorInstance.children
        .map(node => serialize(node, true, shouldAddReferenceNode))
        .join(''),
    );

    const serializedHtmlContent = contentParser.wrapLakeHtmlBody(
      editorInstance.children
        .map(node => serialize(node, false, shouldAddReferenceNode))
        .join(''),
    );

    const onSuccess = () => {
      setEditorValue([]);
      setCurrentType(null);
    };

    const onError = () => {
      message.error(__i18n('保存失败'));
    };

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
            const url = LinkHelper.goMyNote();
            message.success(
              <span>
                {__i18n('保存成功')}，
                <a target="_blank" href={url}>
                  {__i18n('去小记查看')}
                </a>
              </span>,
            );
            onSuccess();
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
            const url = LinkHelper.goDoc(doc);
            message.success(
              <span>
                {__i18n('保存成功')}，
                <a target="_blank" href={url}>
                  {__i18n('立即查看')}
                </a>
              </span>,
            );
            onSuccess();
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
      editorValue,
      currentBookId,
      showContinueButton,
      currentType,
    },
    onSave,
    onContinue,
    onSelectType,
    onSelectBookId,
  };
};

const SaveTo = props => {
  const { currentType, editorValue } = useContext(EditorValueContext);
  const {
    state: { books, currentBookId, showContinueButton },
    onSelectBookId,
    onSave,
    onContinue,
    onSelectType,
  } = useViewModel(props);
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
          onOpenChange={(openKeys: string[]) => {
            onSelectType(openKeys[0]);
          }}
          items={SELECT_TYPES.map(item => ({
            key: item.key,
            icon: item.icon,
            label: item.text,
          }))}
        />
        <div className={classnames(styles.actionTip, styles.clipTarger)}>
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
        <Button className={styles.button} type="primary" block onClick={onSave}>
          {__i18n('保存到')}
          {currentBookId === NOTE_DATA.id ? __i18n('小记') : __i18n('知识库')}
        </Button>
        {showContinueButton && (
          <Button className={styles.button} block onClick={onContinue}>
            {__i18n('继续选取')}
          </Button>
        )}
        {currentType && (
          <div className={styles.editor}>
            <Editor
              onLoad={editor => (editorInstance = editor)}
              defaultValue={editorValue}
            />
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default SaveTo;
