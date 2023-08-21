import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

export interface KernelEditorProps {
  value: string;
  onLoad?: () => void;
}

const key = 'ID' + parseInt(Math.random() * Math.pow(10, 10) + '', 10).toString(16);
const getRequestID = (() => {
  let id = 0;
  return () => {
    id++;
    return id;
  };
})();

export interface IKernelEditorRef {
  /**
   * 设置文档内容，将清空旧的内容
   * @param html html内容
   */
  setContent: (type: 'lake' | 'text/html', data: string) => Promise<void>;
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
  isEmpty: () => Promise<boolean>;

  /**
   * 获取额外信息
   * @return
   */
  getSummaryContent: () => Promise<string>;

  /**
   * 统计字数
   * @return
   */
  wordCount: () => Promise<number>;
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
  <script src="chrome-extension://ehnlicbeaedobffiadggeebjbmcgjnjh/doc.umd.js"></script>
  <script>
    const { KernelFactory, Plugins } = window.Doc;
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
    ];
    CoreKernelFactory.registerKernelPlugin(OpenKernelPlugins);

    // 创建编辑器
    window.newEditor = CoreKernelFactory.createKernel({});

    window.addEventListener('message', function (event) {
      if (event.data.key === '${key}') {
        switch (event.data.type) {
          case 'set-content':
            window.newEditor.setDocument(event.data.data.type, event.data.data.content);
            window.parent.postMessage({
              key: '${key}',
              requestId: event.data.requestId,
              type: 'set-content-success',
            }, '*');
            break;
          case 'get-content':
            window.parent.postMessage({
              key: '${key}',
              requestId: event.data.requestId,
              type: 'get-content',
              data: window.newEditor.getDocument(event.data.data.type),
            }, '*');
            break;
          case 'get-summary-content':
            window.parent.postMessage({
              key: '${key}',
              requestId: event.data.requestId,
              type: 'get-summary-content',
              data: window.newEditor.queryCommandValue('getSummary', 'lake'),
            }, '*');
            break;
          case 'word-count':
            window.parent.postMessage({
              key: '${key}',
              requestId: event.data.requestId,
              type: 'word-count',
              data: window.newEditor.queryCommandValue('wordCount'),
            }, '*');
            break;
          case 'is-empty':
            window.parent.postMessage({
              key: '${key}',
              requestId: event.data.requestId,
              type: 'is-empty',
              data: window.newEditor.queryCommandValue('isEmpty'),
            }, '*');
            break;
          default:
            break;
        }
      }
    });
    window.parent.postMessage({
      key: '${key}',
      type: 'editor-ready',
    }, '*');
  </script>
</body>
</html>
`;

export default forwardRef<IKernelEditorRef, KernelEditorProps>((props, ref) => {
  const { value, onLoad } = props;
  const [ _loading, setLoading ] = useState(true);
  const [ sendMessage, setSendMessage ] = useState<(data: any)=> Promise<any>>(null);
  const contextRef = useRef({
    onLoad: props.onLoad,
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const resolveCache: Map<number, ((data: any) => void)> = new Map();

    const messageFunc = (event: MessageEvent<any>) => {
      if (event.data.key !== key) return;
      if (resolveCache.has(event.data.requestId)) {
        resolveCache.get(event.data.requestId)(event.data);
        resolveCache.delete(event.data.requestId);
      }

      if (event.data.type === 'editor-ready') {
        setSendMessage(requestData => {
          return new Promise(resolve => {
            const requestId = getRequestID();
            resolveCache.set(requestId, data => {
              resolve(data);
            });
            iframeRef.current?.contentWindow?.postMessage({
              key,
              requestId,
              ...requestData,
            }, '*');
          });
        });
      }
    };
    window.addEventListener('message', messageFunc);
    return () => {
      window.removeEventListener('message', messageFunc);
    };
  }, []);

  // 设置编辑器内容
  useEffect(() => {
    if (!sendMessage) return;
    sendMessage({
      type: 'set-content',
      data: {
        type: 'text/html',
        content: value,
      },
    }).then(() => {
      setLoading(false);
      contextRef.current?.onLoad?.();
    });
  }, [ sendMessage, value ]);

  // 更新回调
  useEffect(() => {
    contextRef.current.onLoad = onLoad;
  }, [ onLoad ]);

  // 导出ref
  useImperativeHandle(ref, () => ({
    setContent: (type: 'lake' | 'text/html', content: string) => {
      if (!sendMessage) return Promise.resolve();
      return sendMessage({
        type: 'set-content',
        data: {
          type,
          content,
        },
      });
    },
    isEmpty: () => {
      if (!sendMessage) return Promise.resolve(true);
      return sendMessage({
        type: 'is-empty',
      }).then(data => {
        return data.data;
      });
    },
    getContent: async (type: 'lake' | 'text/html' | 'description') => {
      if (!sendMessage) return Promise.resolve('');
      return sendMessage({
        type: 'get-content',
        data: {
          type: type === 'lake' ? 'text/lake' : type,
        },
      }).then(data => {
        return data.data;
      });
    },
    getSummaryContent: () => {
      if (!sendMessage) return Promise.resolve('');
      return sendMessage({
        type: 'get-summary-content',
      }).then(data => {
        return data.data;
      });
    },
    wordCount: () => {
      if (!sendMessage) return Promise.resolve(0);
      return sendMessage({
        type: 'word-count',
      }).then(data => {
        return data.data;
      });
    },
  }),
  [ sendMessage ],
  );

  // 渲染iframe
  // 通过iframe加载lake编辑器防止样式污染
  return (
    <iframe
      ref={iframeRef}
      height="100%"
      id={key}
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
