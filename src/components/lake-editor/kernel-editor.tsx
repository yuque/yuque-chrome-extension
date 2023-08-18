import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import loadLakeEditor from './load';

export interface KernelEditorProps {
  value: string;
  onChange?: (value: string) => void;
  onLoad?: () => void;
}

export interface IKernelEditorRef {
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
  setContent: (type: 'lake' | 'text/html', data: string) => void;
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
</head>
<body>
  <script src="./doc.umd.js"></script>
</body>
</html>
`;

export default forwardRef<IKernelEditorRef, KernelEditorProps>((props, ref) => {
  const { value, onChange, onLoad } = props;
  const [ _loading, setLoading ] = useState(true);
  const [ editor, setEditor ] = useState<any>(null);
  const contextRef = useRef({
    onChange: props.onChange,
    onLoad: props.onLoad,
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /**
   * 目前看iframe的current一定会在此时被赋值
   */
  useEffect(() => {
    function loadFunc() {
      const win = iframeRef.current.contentWindow;
      // 加载编辑器
      loadLakeEditor(win).then(() => {
        setLoading(false);
        const { KernelFactory, Plugins } = win.Doc;
        const CoreKernelFactory = new KernelFactory();

        const OpenKernelPlugins = [
          Plugins.Alert.AlertPlugin,
          Plugins.Meta.MetaPlugin, // 要在 layout 前
          Plugins.Alignment.AlignmentPlugin,
          Plugins.BasicTextStyle.BasicTextStylePlugin,
          Plugins.BgColor.BgColorPlugin,
          Plugins.BreakLine.BreakLinePlugin,
          Plugins.Card.CardPlugin,
          Plugins.ClearFormat.ClearFormatPlugin,
          Plugins.Clipboard.ClipboardPlugin,
          Plugins.Code.CodePlugin,
          Plugins.Color.ColorPlugin,
          Plugins.Container.ContainerPlugin,
          Plugins.Content.ContentPlugin,
          Plugins.Delete.DeletePlugin,
          Plugins.DropFile.DropFilePlugin,
          Plugins.FallbackCard.FallbackCardPlugin,
          Plugins.File.FileCardPlugin,
          Plugins.FileReader.FileReaderPlugin,
          Plugins.Focus.FocusPlugin,
          Plugins.Fontsize.FontsizePlugin,
          Plugins.FormatPainter.FormatPainterPlugin,
          Plugins.Heading.HeadingPlugin,
          Plugins.History.HistoryPlugin,
          Plugins.Hr.HrCardPlugin,
          Plugins.HtmlDataSource.HTMLDataSourcePlugin,
          Plugins.Image.ImagePlugin,
          Plugins.Indent.IndentPlugin,
          Plugins.InodeDataSource.INodeReaderPlugin,
          Plugins.Input.InputPlugin,
          Plugins.Label.LabelCardPlugin,
          Plugins.LakeDataSource.LakePlugin,
          Plugins.Layout.LayoutPlugin,
          Plugins.LineHeight.LineHeightPlugin,
          Plugins.Link.LinkPlugin,
          Plugins.List.ListPlugin,
          Plugins.Mark.MarkPlugin,
          Plugins.Markdown.MarkdownPlugin,
          Plugins.MarkdownPasteParse.MarkdownPasteParsePlugin,
          Plugins.Paragraph.ParagraphPlugin,
          Plugins.QuickInput.QuickInputPlugin,
          Plugins.Quote.QuotePlugin,
          Plugins.Save.SavePlugin,
          Plugins.Selectall.SelectAllPlugin,
          Plugins.Selection.SelectionPlugin,
          Plugins.Slash.SlashPlugin,
          Plugins.Subscript.SubscriptPlugin,
          Plugins.Table.TablePlugin,
          Plugins.TextDataSource.TextDataSourcePlugin,
          Plugins.Typography.TypographyPlugin,
          Plugins.MarkdownDataSource.MarkdownDataSourcePlugin,
          Plugins.Codeblock.CodeBlockCardPlugin,
          Plugins.Mention.MentionCardPlugin,
          Plugins.Video.VideoPlugin,
          Plugins.Columns.ColumnsPlugin,
          Plugins.Collapse.CollapsePlugin,
          Plugins.Math.MathCardPlugin,
          Plugins.Thirdparty.ThirdpartyPlugin,
          Plugins.KernelAssistant.KernelAssistantPlugin,
          Plugins.Summary.SummaryPlugin,
        ] as const;

        CoreKernelFactory.registerKernelPlugin(OpenKernelPlugins);

        // 创建编辑器
        const newEditor = CoreKernelFactory.createKernel({});
        // @ts-expect-error 注入调试变量
        win.__engine = newEditor;
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
      editor.execCommand('paste', {
        types: [ 'text/html' ],
        getData() {
          return html;
        },
      });
    },
    setContent: (type: 'lake' | 'text/html', content: string) => {
      if (!editor) return;
      editor.setDocument(type, content);
    },
    isEmpty: () => {
      if (!editor) return true;
      return editor.queryCommandValue('isEmpty');
    },
    getContent: async (type: 'lake' | 'text/html' | 'description') => {
      if (!editor) return '';
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
    insertBreakLine: () => {
      if (!editor) return;
      editor.execCommand('breakLine');
    },
  }),
  [ editor ],
  );

  // 渲染iframe
  // 通过iframe加载lake编辑器防止样式污染
  return (
    <iframe
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
      }}
    />
  );
});
