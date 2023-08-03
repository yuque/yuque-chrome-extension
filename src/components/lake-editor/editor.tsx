import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import loadLakeEditor from './load';
import { InjectEditorPlugin } from './editor-plugin';

export interface EditorProps {
  value: string;
  children?: React.ReactElement;
  onChange?: (value: string) => void;
  onLoad?: () => void;
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
  setContent: (html: string) => void;
  /**
   * 获取文档内容
   * @param type 内容的格式
   * @return 文档内容
   */
  getContent: (type: 'lake'|'text/html') => string;
  /**
   * 判断当前文档是否是空文档
   * @return true表示当前是空文档
   */
  isEmpty: () => boolean;
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
      padding: 0 0 0 14px;
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
            isCaptureImageURL() {
              return false;
            },
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
      editor.execCommand('focus', 'end');
    },
    setContent: (html: string) => {
      if (!editor) return;
      iframeRef.current?.focus();
      editor.setDocument('text/html', html);
      editor.execCommand('focus', 'end');
    },
    isEmpty: () => {
      if (!editor) return true;
      return editor.queryCommandValue('isEmpty');
    },
    getContent: (type: 'lake'|'text/html'|'description') => {
      if (!editor) return '';
      if (type === 'lake') {
        return editor.getDocument('text/lake');
      } else if (type === 'text/html') {
        return editor.getDocument('text/html');
      }
      return editor.getDocument('description');

    },
  }), [ editor ]);

  useEffect(() => {
    if (!rootNodeRef.current.div) return;
    ReactDOM.render(
      props.children,
      rootNodeRef.current.div,
    );
  }, [ props.children ]);

  // 渲染iframe
  // 通过iframe加载lake编辑器防止样式污染
  return <iframe
    ref={iframeRef}
    height="100%"
    srcDoc={templateHtml}
    allow="*"
    style={{
      position: 'absolute',
      background: 'transparent',
      border: 'none',
      height: '100%',
      width: '100%',
    }}/>;
});

