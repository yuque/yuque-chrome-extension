import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Root, createRoot } from 'react-dom/client';
import { __i18n } from '@/isomorphic/i18n';
import OcrIconSvg from '@/assets/svg/ocr-icon.svg';
import { isWindow } from '@/core/browser-system-link';
import loadLakeEditor from './load';
import { InjectEditorPlugin } from './editor-plugin';
import { slash } from './slash-options';
import { templateHtml } from './template-html';
import { showEditorModal } from './modal-ocr';

const blockquoteID = 'yqextensionblockquoteid';

export interface EditorProps {
  value: string;
  children?: React.ReactNode;
  onChange?: (value: string) => void;
  onLoad?: () => void;
  onSave?: () => void;
  uploadImage?: (params: { data: string | File }) => Promise<{
    url: string;
    size: number;
    filename: string;
  }>;
}

function sleep(ms: number) {
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

export default forwardRef<IEditorRef, EditorProps>((props, ref) => {
  const { value, onChange, onLoad } = props;
  const [_loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<any>(null);
  const contextRef = useRef({
    onChange: props.onChange,
    onLoad: props.onLoad,
  });
  const rootNodeRef = useRef<{ div: Root | null }>({
    div: null,
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /**
   * 目前看iframe的current一定会在此时被赋值
   */
  useEffect(() => {
    function loadFunc() {
      const doc = iframeRef.current?.contentDocument;
      const win = iframeRef.current?.contentWindow;
      if (!doc || !win) {
        return;
      }
      // 加载编辑器
      loadLakeEditor(win).then(() => {
        setLoading(false);
        const root = createRoot(doc.getElementById('child') as HTMLDivElement);
        rootNodeRef.current.div = root;

        if (rootNodeRef.current.div) {
          rootNodeRef.current.div.render(props.children);
        }
        const { createOpenEditor } = win.Doc;
        // 注入插件
        InjectEditorPlugin(win.Doc, doc);
        // 创建编辑器
        const newEditor = createOpenEditor(doc.getElementById('root'), {
          scrollNode: () => {
            return doc.querySelector('.ne-editor-wrap');
          },
          slash,
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
            editUI: class extends win.Doc.EditCardUI.extend(win.Doc.Plugins.Image.editImageUIAddon) {
              init(...args: any[]) {
                super.init(...args);
                this.on('uploadSuccess', (data: { ocrTask: Promise<any>}) => {
                  data.ocrTask.then(res => {
                    this.cardData.setImageInfo({ ...data, ocrLocations: res });
                  });
                });
              }
            },
            innerButtonWidgets: [
              {
                name: 'ocr',
                title: 'OCR',
                icon: <OcrIconSvg fill="#fff" />,
                enable: (cardUI: any) => {
                  return cardUI.cardData.getOcrLocations()?.length > 0;
                },
                execute: (cardUI: any) => {
                  cardUI.copyText = win.Doc.FrameworkUtils.copyText;
                  cardUI.Icon = win.Doc.FrameworkUiLib.Icon;
                  cardUI.insertTextAfterImage = (text: string) => {
                    newEditor.execCommand(
                      'insertAfterImage',
                      cardUI.cardNode.id,
                      text,
                    );
                    newEditor.execCommand('focus');
                  };
                  showEditorModal(cardUI);
                },
              },
            ],
          },
          placeholder: __i18n('输入内容...'),
          defaultFontsize: 14,
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
    editor.execCommand('paragraphSpacing', 'relax');
    contextRef.current?.onLoad?.();
  }, [editor, value]);

  useEffect(() => {
    if (!editor || !iframeRef.current) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (isWindow ? e.ctrlKey : e.metaKey)) {
        props.onSave?.();
      }
    };
    iframeRef.current?.contentDocument?.addEventListener(
      'keydown',
      onKeyDown,
      true,
    );
    return () => {
      iframeRef.current?.contentDocument?.removeEventListener(
        'keydown',
        onKeyDown,
        true,
      );
    };
  }, [editor, iframeRef, props.onSave]);

  // 更新回调
  useEffect(() => {
    contextRef.current.onChange = onChange;
    contextRef.current.onLoad = onLoad;
  }, [onChange, onLoad]);

  // 导出ref
  useImperativeHandle(
    ref,
    () => ({
      appendContent: (html: string, breakLine = false) => {
        if (!editor) return;
        if (breakLine) {
          editor.execCommand('breakLine');
        }
        editor.kernel.execCommand('insertHTML', html);
        iframeRef.current?.focus();
        editor.execCommand('focus');
        editor.renderer.scrollToCurrentSelection();
      },
      setContent: (
        content: string,
        type: 'text/lake' | 'text/html' = 'text/html',
      ) => {
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
          return editor.getDocument('text/lake', { includeMeta: true });
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
    [editor],
  );

  useEffect(() => {
    if (!rootNodeRef.current.div) return;
    rootNodeRef.current.div.render(props.children);
  }, [props.children]);

  // 渲染iframe
  // 通过iframe加载lake编辑器防止样式污染
  return (
    <iframe
      ref={iframeRef}
      height="100%"
      width="100%"
      srcDoc={templateHtml}
      allow="*"
      style={{
        background: 'transparent',
        border: 'none',
      }}
    />
  );
});
