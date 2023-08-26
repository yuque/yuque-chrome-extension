/* eslint-disable @typescript-eslint/no-explicit-any */
declare class IEditorPlugin {
  editor: any;
  init(): void;
}

declare class IKernelPlugin {
  kernel: any;
  init(kernel: any): void;
}

declare class IRendererPlugin {
  editor: any;
  init(): void;
}

export type IEditorPluginCls = new () => IEditorPlugin;
export type IKernelPluginCls = new () => IKernelPlugin;
export type IRendererPluginCls = new () => IRendererPlugin;

export function InjectEditorPlugin({ EditorPlugin, KernelPlugin, Plugins, OpenEditorFactory, toolbarItems }: {
  EditorPlugin: IEditorPluginCls;
  KernelPlugin: IKernelPluginCls;
  Plugins: Record<string, any>;
  OpenEditorFactory: {
    editorPlugins: IEditorPluginCls[];
    registerEditorPlugin: (plugins: IEditorPluginCls[]) => void;
    registerRenderPlugin: (plugins: IRendererPluginCls[]) => void;
    registerKernelPlugin: (plugins: IKernelPluginCls[]) => void;
  };
  toolbarItems: Record<string, string>
}, doc: Document) {

  class CustomEditorPlugin extends EditorPlugin {
    static PluginName = 'CustomEditorPlugin';

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

      this.editor
        .getService({ value: 'IToolbarEditorService' })
        ?.setLayer(doc.getElementById('toolbar') as HTMLDivElement);
    }
  }

  class CustomKernelPlugin extends KernelPlugin {
    static PluginName = 'CustomEditorPlugin';

    override init(kernel: any) {
      const htmlService = kernel.getService({ value: 'IHTMLKernelService' });

      if (htmlService) {
        htmlService.registerHTMLNodeReader(
          [ 'blockquote' ],
          {
            readNode(context: any, node: any) {
              context.setNode({
                id: node.attrs.id || '',
                type: 'element',
                name: 'quote',
                attrs: {},
              });
            },
            leaveNode() {
              // ignore empty
            },
          },
        );
      }
    }
  }

  // 优先加载
  OpenEditorFactory.editorPlugins.unshift(CustomEditorPlugin);
  OpenEditorFactory.editorPlugins[CustomEditorPlugin.PluginName] = CustomEditorPlugin;
  OpenEditorFactory.registerKernelPlugin([ CustomKernelPlugin ]);
  OpenEditorFactory.registerRenderPlugin([ Plugins.AutoScroll.AutoScrollRenderPlugin ]);
}
