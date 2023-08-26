import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';
import bowser from 'bowser';
import loadLakeEditor from './load';
import { InjectEditorPlugin } from './editor-plugin';

const blockquoteID = 'yqextensionblockquoteid';

export interface EditorProps {
  value: string;
  children?: React.ReactElement;
  onChange?: (value: string) => void;
  onLoad?: () => void;
  onSave: () => void;
  uploadImage: (params: { data: string | File }) => Promise<{
    url: string;
    size: number;
    filename: string;
  }>;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface IEditorRef {
  /**
   * 追加html到文档
   * @param html html内容
   * @param breakLine 是否前置一个换行符
   */
  appendContent: (html: string, breakLine?: boolean) => void;
  /**
   * 设置文档内容，将清空旧的内容
   * @param html html内容
   */
  setContent: (content: string, type?: 'text/lake' | 'text/html') => void;
  /**
   * 获取文档内容
   * @param type 内容的格式
   * @return 文档内容
   */
  getContent: (type: 'lake' | 'text/html') => Promise<string>;
  /**
   * 判断当前文档是否是空文档
   * @return true表示当前是空文档
   */
  isEmpty: () => boolean;

  /**
   * 获取额外信息
   * @return
   */
  getSummaryContent: () => string;

  /**
   * 统计字数
   * @return
   */
  wordCount: () => number;

  /**
   * 聚焦到文档开头
   * @param {number} offset 偏移多少个段落，可以将选区落到开头的第offset个段落上, 默认是0
   * @return
   */
  focusToStart: (offset?: number) => void;

  /**
   * 插入换行符
   * @return
   */
  insertBreakLine: () => void;
}

/**
 * iframe的内容
 */
const templateHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title></title>
  <link rel="stylesheet" type="text/css" href="./doc.css"/>
  <style>
    body {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .toolbar-container {
      display: flex;
      padding: 0 0 0 24px;
    }
    #toolbar {
      flex: 1;
    }
    #root {
      flex: 1;
      overflow: hidden;
    }
    #child {
      display: flex;
      align-items: center;
      padding: 0 16px;
    }
    .ne-layout-mode-fixed .ne-engine, .ne-layout-mode-adapt .ne-engine {
      padding-top: 16px;
    }
    .ne-layout-mode-fixed .ne-editor-body, .ne-layout-mode-adapt .ne-editor-body {
      height: 100%;
    }
    .ne-ui-overlay-button {
      width: 28px !important;
      height: 28px !important;
      padding: 0 !important;;
      border: none !important;;
    }
    ::selection {
      color: #fff !important;
      background: #1677ff !important;
    }
  </style>
</head>
<body>
  <div class="toolbar-container">
    <div id="toolbar"></div>
    <div id="child"></div>
  </div>
  <div id="root"></div>
  <script src="./doc.umd.js"></script>
</body>
</html>
`;

export default forwardRef<IEditorRef, EditorProps>((props, ref) => {
  const { value, onChange, onLoad } = props;
  const [ _loading, setLoading ] = useState(true);
  const [ editor, setEditor ] = useState<any>(null);
  const contextRef = useRef({
    onChange: props.onChange,
    onLoad: props.onLoad,
  });
  const rootNodeRef = useRef<{ div: HTMLDivElement | null }>({
    div: null,
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /**
   * 目前看iframe的current一定会在此时被赋值
   */
  useEffect(() => {
    function loadFunc() {
      const doc = iframeRef.current.contentDocument;
      const win = iframeRef.current.contentWindow;
      // 加载编辑器
      loadLakeEditor(win).then(() => {
        setLoading(false);
        rootNodeRef.current.div = doc.getElementById('child') as HTMLDivElement;
        if (rootNodeRef.current.div) {
          ReactDOM.render(
            props.children,
            rootNodeRef.current.div,
          );
        }
        const { createOpenEditor } = win.Doc;
        // 注入插件
        InjectEditorPlugin(win.Doc, doc);
        // 创建编辑器
        const newEditor = createOpenEditor(doc.getElementById('root'), {
          scrollNode: () => {
            return doc.querySelector('.ne-editor-wrap');
          },
          slash: {
            cardSelect: {
              general: {
                groups: [
                  {
                    type: 'icon',
                    show: 'slash', // 只在斜杠面板中出现
                    items: [
                      'p',
                      'h1',
                      'h2',
                      'h3',
                      'h4',
                      'h5',
                      'h6',
                      'unorderedList',
                      'orderedList',
                      'taskList',
                      'link',
                      'code',
                    ],
                  },
                  {
                    get title() {
                      return '基础';
                    },
                    name: 'group-base',
                    type: 'column',
                    items: [
                      'label',
                      {
                        name: 'table',
                        allowSelector: true,
                      },
                    ],
                  },
                  {
                    get title() {
                      return '布局和样式';
                    },
                    name: 'group-layout',
                    type: 'normal',
                    items: [
                      'quote',
                      'hr',
                      'alert',
                      {
                        name: 'columns',
                        childMenus: [
                          'columns2',
                          'columns3',
                          'columns4',
                        ],
                      },
                      'collapse',
                    ],
                  },
                  {
                    get title() {
                      return '程序员';
                    },
                    name: 'group-files',
                    type: 'normal',
                    items: [ 'codeblock', 'math' ],
                  },
                ],
              },
              table: {
                groups: [
                  {
                    type: 'icon',
                    show: 'slash', // 只在斜杠面板中出现
                    items: [
                      'p',
                      'h1',
                      'h2',
                      'h3',
                      'h4',
                      'h5',
                      'h6',
                      'unorderedList',
                      'orderedList',
                      'taskList',
                      'link',
                      'code',
                    ],
                  },
                  {
                    get title() {
                      return '基础';
                    },
                    name: 'group-base',
                    type: 'normal',
                    items: [
                      'label',
                      'math',
                    ],
                  },
                ],
              },
            },
          },
          codeblock: {
            codemirrorURL: './CodeMirror.js',
          },
          math: {
            KaTexURL: './katex.min.js',
          },
          image: {
            isCaptureImageURL(url: string) {
              return !url?.startsWith('https://cdn.nlark.com/yuque');
            },
            createUploadPromise: props.uploadImage,
          },
        });
        newEditor.on('visitLink', (url: string) => {
          window.open(url, '__blank');
        });
        // 监听内容变动
        newEditor.on('contentchange', () => {
          contextRef.current.onChange?.(newEditor.getDocument('text/lake'));
        });
        // @ts-expect-error 注入调试变量
        win.editor = newEditor;
        // 设置编辑器到状态
        setEditor(newEditor);
      });
    }
    iframeRef.current?.addEventListener('load', loadFunc);
    return () => {
      iframeRef.current?.removeEventListener('load', loadFunc);
    };
  }, []);

  // 设置编辑器内容
  useEffect(() => {
    if (!editor) return;
    editor.setDocument('text/html', value);
    contextRef.current?.onLoad?.();
  }, [ editor, value ]);

  useEffect(() => {
    if (!editor || !iframeRef.current) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (bowser.windows ? e.ctrlKey : e.metaKey)) {
        props.onSave();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    iframeRef.current?.contentDocument.addEventListener(
      'keydown',
      onKeyDown,
      true,
    );
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      iframeRef.current?.contentDocument.removeEventListener(
        'keydown',
        onKeyDown,
      );
    };
  }, [ editor, iframeRef ]);

  // 更新回调
  useEffect(() => {
    contextRef.current.onChange = onChange;
    contextRef.current.onLoad = onLoad;
  }, [ onChange, onLoad ]);

  // 导出ref
  useImperativeHandle(ref, () => ({
    appendContent: (html: string, breakLine = false) => {
      if (!editor) return;
      if (breakLine) {
        editor.execCommand('breakLine');
      }
      editor.kernel.execCommand('paste', {
        types: [ 'text/html' ],
        getData() {
          return html;
        },
      });
      iframeRef.current?.focus();
      editor.execCommand('focus');
      editor.renderer.scrollToCurrentSelection();
    },
    setContent: (content: string, type: 'text/lake' | 'text/html' = 'text/html') => {
      if (!editor) return;
      iframeRef.current?.focus();
      editor.setDocument(type, content);
      editor.execCommand('focus', 'end');
      // 寻找定位的block 插入到block上方
      const node = editor.kernel.model.document.getNodeById(blockquoteID);
      if (node) {
        const rootNode = editor.kernel.model.document.rootNode;
        if (rootNode.firstNode === node) {
          return;
        }
        editor.kernel.execCommand('selection', {
          ranges: [
            {
              start: {
                node: rootNode.children[node.offset - 1],
                offset: rootNode.children[node.offset - 1].childCount,
              },
            },
          ],
        });
        editor.execCommand('focus');
      }
    },
    isEmpty: () => {
      if (!editor) return true;
      return editor.queryCommandValue('isEmpty');
    },
    getContent: async (type: 'lake' | 'text/html' | 'description') => {
      if (!editor) return '';
      let times = 0;
      while (!editor.canGetDocument()) {
        // 10s 后返回超时
        if (times > 100) {
          throw new Error('文档上传未结束! 请删除未上传成功的图片');
        }
        times++;
        await sleep(100);
      }
      if (type === 'lake') {
        return editor.getDocument('text/lake');
      } else if (type === 'text/html') {
        return editor.getDocument('text/html');
      }
      return editor.getDocument('description');
    },
    getSummaryContent: () => {
      if (!editor) return '';
      return editor.queryCommandValue('getSummary', 'lake');
    },
    wordCount: () => {
      if (!editor) return 0;
      return editor.queryCommandValue('wordCount');
    },
    focusToStart: (offset = 0) => {
      if (!editor) return;
      iframeRef.current?.focus();
      if (offset) {
        editor.kernel.execCommand('selection', {
          ranges: [
            {
              start: {
                node: editor.kernel.model.document.rootNode.children[offset],
                offset: 0,
              },
            },
          ],
        });
        editor.execCommand('focus');
      } else {
        editor.execCommand('focus', 'start');
      }
    },
    insertBreakLine: () => {
      if (!editor) return;
      editor.execCommand('breakLine');
    },
  }),
  [ editor ],
  );

  useEffect(() => {
    if (!rootNodeRef.current.div) return;
    ReactDOM.render(
      props.children,
      rootNodeRef.current.div,
    );
  }, [ props.children ]);

  // 渲染iframe
  // 通过iframe加载lake编辑器防止样式污染
  return (
    <iframe
      ref={iframeRef}
      height="100%"
      srcDoc={templateHtml}
      allow="*"
      style={{
        background: 'transparent',
        border: 'none',
      }}
    />
  );
});
