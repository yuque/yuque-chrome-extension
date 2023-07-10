import React, { useState, useEffect, useContext } from 'react';
import { Button, Radio, Select, message, Space } from 'antd';
import { get as safeGet, isEmpty } from 'lodash';
import { EditFilled, BookFilled } from '@ant-design/icons';
import Chrome from '@/core/chrome';
import proxy from '@/core/proxy';
import processHtmls from '@/core/html-parser';
import { CsrfTokenError } from '@/core/request';
import LinkHelper from '@/core/link-helper';
import Editor from '@/components/editor/Editor';
import serialize from '@/components/editor/serialize';
import deserialize from '@/components/editor/deserialize';
import formatHTML from '@/components/editor/format-html';
import formatMD from '@/components/editor/format-md';
import contentParser from '@/components/editor/content-parser';
import { GLOBAL_EVENTS } from '@/events';
import { getCurrentAccount } from '@/core/account';
import styles from './SaveTo.module.less';
import { EditorValueContext } from './EditorValueContext';

type MessageSender = chrome.runtime.MessageSender;

type SendResponse = (response: any) => void;

interface RequestMessage {
  action: keyof typeof GLOBAL_EVENTS;
  htmls?: string[];
}

let editorInstance;

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
      return __i18n('选取');
    },
  },
  {
    key: 'bookmark',
    enabled: true,
    get text() {
      return __i18n('链接卡片');
    },
  },
  {
    key: 'all-page',
    enabled: false,
    get text() {
      return __i18n('整个页面(即将支持)');
    },
  },
];

const useViewModel = () => {
  const [books, setBooks] = useState([NOTE_DATA]);
  const [currentBookId, setCurrentBookId] = useState(NOTE_DATA.id);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const { editorValue, currentType, setEditorValue, setCurrentType } =
    useContext(EditorValueContext);
  const onSelectType = setCurrentType;

  const startSelect = () => {
    getCurrentTab().then(tab => {
      Chrome.tabs.sendMessage(tab.id, {
        action: GLOBAL_EVENTS.START_SELECT,
      });
    });
  };

  useEffect(() => {
    proxy.book.getBooks().then(books => {
      setBooks([NOTE_DATA, ...books]);
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
        console.log(document.body);
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
        const newValue = [
          {
            type: 'heading-two',
            children: [{ text: tab.title }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'link',
                url: tab.url,
                children: [{ text: tab.title }],
              },
            ],
          },
        ];
        setEditorValue(editorValue.concat(newValue));
      });
    } else if (currentType === SELECT_TYPES[2].key) {
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
    }
  }, [currentType]);

  useEffect(() => {
    setShowContinueButton(
      currentType === SELECT_TYPES[1].key && !isEmpty(editorValue),
    );
  }, [editorValue, currentType]);

  const onSave = () => {
    if (!editorInstance) return;
    const serializedAsiContent = contentParser.wrapLakeAslBody(
      editorInstance.children.map(node => serialize(node, true)).join(''),
    );
    const serializedHtmlContent = contentParser.wrapLakeHtmlBody(
      editorInstance.children.map(node => serialize(node, false)).join(''),
    );

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
            getCurrentAccount().then(() => {
              const url = LinkHelper.goMyNote();
              message.success(
                <span>
                  {__i18n('保存成功')}，
                  <a target="_blank" href={url}>
                    {__i18n('去小记查看')}
                  </a>
                </span>,
              );
            });
          })
          .catch(() => {
            message.error(__i18n('保存失败'));
          });
      });
    } else {
      getCurrentTab().then(tab => {
        proxy.doc
          .create({
            title: __i18n('[来自剪藏] {title}', { title: tab.title }),
            book_id: currentBookId,
            body_draft_asl: serializedAsiContent,
            body_asl: serializedAsiContent,
            body: serializedHtmlContent,
          })
          .then(({ data }) => {
            getCurrentAccount().then(() => {
              const url = LinkHelper.goDoc(data.data);
              message.success(
                <span>
                  {__i18n('保存成功')}，
                  <a target="_blank" href={url}>
                    {__i18n('立即查看')}
                  </a>
                </span>,
              );
            });
          })
          .catch(error => {
            if (error instanceof CsrfTokenError) {
              message.error(__i18n('保存失败'));
            } else {
              message.error(__i18n('保存失败'));
            }
          });
      });
    }
  };

  const onContinue = () => {
    startSelect();
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

const SaveTo = () => {
  const { currentType, editorValue } = useContext(EditorValueContext);
  const {
    state: { books, currentBookId, showContinueButton },
    onSelectBookId,
    onSave,
    onContinue,
    onSelectType,
  } = useViewModel();
  return (
    <div className={styles.wrapper}>
      <Radio.Group
        buttonStyle="solid"
        size="small"
        onChange={e => onSelectType(e.target.value)}
      >
        <Space direction="vertical">
          {SELECT_TYPES.map(item => (
            <Radio disabled={!item.enabled} value={item.key}>
              {item.text}
            </Radio>
          ))}
        </Space>
      </Radio.Group>
      <Select
        className={styles.list}
        onChange={(value: string) => onSelectBookId(Number(value))}
        defaultValue={books.find(book => book.id === currentBookId)?.name}
      >
        {books.map(book => {
          const icon = book.type === 'note' ? <EditFilled /> : <BookFilled />;
          return (
            <Select.Option value={book.id}>
              <span style={{ marginRight: 4, color: '#888' }}>{icon}</span>
              {book.name}
            </Select.Option>
          );
        })}
      </Select>
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
  );
};

export default SaveTo;
