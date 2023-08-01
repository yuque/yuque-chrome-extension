declare class IEditorPlugin {
  editor: any;
  init(): void;
}

export type IEditorPluginCls = new () => IEditorPlugin;

export function InjectEditorPlugin({ EditorPlugin, Plugins, OpenEditorFactory, toolbarItems }: {
  EditorPlugin: IEditorPluginCls;
  Plugins: Record<string, any>;
  OpenEditorFactory: {
    editorPlugins: IEditorPluginCls[];
    registerEditorPlugin: (plugins: IEditorPluginCls[]) => void;
    registerRenderPlugin: (plugins: any[]) => void;
  };
  toolbarItems: Record<string, string>
}, doc: Document) {

  class ToolbarCustomEditorPlugin extends EditorPlugin {
    static PluginName = 'ToolbarCustomEditorPlugin';

    override init() {
      /**
       * 修改工具栏的按钮
       */
      this.editor.option.toolbar._option.agentConfig = {
        default: {
          items: [
            toolbarItems.bold,
            toolbarItems.italic,
            toolbarItems.strikethrough,
            toolbarItems.underline,
            '|',
            toolbarItems.color,
            toolbarItems.bgColor,
            '|',
            toolbarItems.quote,
            toolbarItems.hr,
          ],
        },
        table: {
          items: [
            toolbarItems.bold,
            toolbarItems.italic,
            toolbarItems.strikethrough,
            toolbarItems.underline,
            '|',
            toolbarItems.color,
            toolbarItems.bgColor,
            toolbarItems.tableCellBgColor,
            toolbarItems.tableBorderVisible,
            '|',
            toolbarItems.alignment,
            toolbarItems.tableVerticalAlign,
            toolbarItems.tableMergeCell,
            '|',
            toolbarItems.quote,
            toolbarItems.hr,
          ],
        },
      };
      console.info(this.editor
        .getService({ value: 'IToolbarEditorService' }), doc.getElementById('toolbar'));
      this.editor
        .getService({ value: 'IToolbarEditorService' })
        ?.setLayer(doc.getElementById('toolbar') as HTMLDivElement);
    }
  }

  // 优先加载
  OpenEditorFactory.editorPlugins.unshift(ToolbarCustomEditorPlugin);
  OpenEditorFactory.editorPlugins[ToolbarCustomEditorPlugin.PluginName] = ToolbarCustomEditorPlugin;
  OpenEditorFactory.registerRenderPlugin([ Plugins.AutoScroll.AutoScrollRenderPlugin ]);
}
