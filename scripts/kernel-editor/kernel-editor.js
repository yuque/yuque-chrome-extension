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

window.addEventListener('message', function(event) {
  if (event.data.key === 'kernel-editor') {
    switch (event.data.type) {
      case 'set-content':
        window.newEditor.setDocument(event.data.data.type, event.data.data.content);
        window.parent.postMessage({
          key: 'kernel-editor',
          requestId: event.data.requestId,
          type: 'set-content-success',
        }, '*');
        break;
      case 'get-content':
        window.parent.postMessage({
          key: 'kernel-editor',
          requestId: event.data.requestId,
          type: 'get-content',
          data: window.newEditor.getDocument(event.data.data.type),
        }, '*');
        break;
      case 'get-summary-content':
        window.parent.postMessage({
          key: 'kernel-editor',
          requestId: event.data.requestId,
          type: 'get-summary-content',
          data: window.newEditor.queryCommandValue('getSummary', 'lake'),
        }, '*');
        break;
      case 'word-count':
        window.parent.postMessage({
          key: 'kernel-editor',
          requestId: event.data.requestId,
          type: 'word-count',
          data: window.newEditor.queryCommandValue('wordCount'),
        }, '*');
        break;
      case 'is-empty':
        window.parent.postMessage({
          key: 'kernel-editor',
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
  key: 'kernel-editor',
  type: 'editor-ready',
}, '*');
