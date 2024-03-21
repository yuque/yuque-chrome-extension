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

declare class CommandClass {
  static UNAVAILABLE: string;
  static EXECUTED: string;
  static NOT_EXECUTED: string;
  static UNKNOWN: string;

  public readonly kernel: any;
  public readonly editing: any;

  destroy(): void;

  execute(editing: any, ...args: any[]): any;

  getValue(job: any, ...args: any[]): any;
}

export type IEditorPluginCls = new () => IEditorPlugin;
export type IKernelPluginCls = (new () => IKernelPlugin) & {PluginName: string};
export type IRendererPluginCls = new () => IRendererPlugin;
export type ICommandCls = new () => CommandClass;

export function InjectEditorPlugin({ EditorPlugin, KernelPlugin, PositionUtil, OpenEditorFactory, toolbarItems, Command, SelectionUtil }: {
  EditorPlugin: IEditorPluginCls;
  KernelPlugin: IKernelPluginCls;
  Plugins: Record<string, any>;
  Command: ICommandCls;
  SelectionUtil: any;
  PositionUtil: any;
  OpenEditorFactory: {
    editorPlugins: IEditorPluginCls[];
    kernelPlugins: IKernelPluginCls[];
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

  class InsertHTMLCommand extends Command {
    override execute(editing: any, html: string) {
      const job = editing.newJob();
      const { kernel } = this;

      let inode = kernel.readData('text/html', html, {
        from: 'insert',
        self: false,
        forceText: false,
      });
      if (!inode) {
        return false;
      }

      inode = kernel.getExtendMethod('normalizeINodeTree')?.(job, inode) || inode;

      job.setSelection(SelectionUtil.insertINode(job, job.getSelection(), inode));

      editing.commitJob(job);

      return true;
    }
  }
  class ImageInsertAfterCommand extends Command {

    override execute(editing: any, cardNodeId: string, text: string) {
      const job = editing.newJob();
      const node = job.getNodeById(cardNodeId);

      if (!node || !node.isConnected || !node.isCardNode() || !node.parentNode) {
        editing.cancelJob(job);
        return false;
      }

      let position = PositionUtil.breakLine(
        job,
        job.newPosition(node.parentNode, node.offset + 1),
      );

      position = PositionUtil.insertText(job, position, text);

      job.setSelection([job.newRange(position)]);
      editing.commitJob(job);

      return true;
    }
  }

  class CustomKernelPlugin extends KernelPlugin {
    static PluginName = 'CustomEditorPlugin';

    override init(kernel: any) {
      kernel.registerCommand('insertHTML', new InsertHTMLCommand());
      kernel.registerCommand('insertAfterImage', new ImageInsertAfterCommand());
      const htmlService = kernel.getService({ value: 'IHTMLKernelService' });

      if (htmlService) {
        htmlService.registerHTMLNodeReader(
          ['blockquote'],
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
        htmlService.registerHTMLNodeReader(
          ['code'],
          {
            readNode(context: any, node: any) {
              context.setNode({
                id: node.attrs.id || '',
                type: 'element',
                name: 'code',
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
  // @ts-expect-error not error
  OpenEditorFactory.editorPlugins[CustomEditorPlugin.PluginName] = CustomEditorPlugin;
  OpenEditorFactory.registerKernelPlugin([CustomKernelPlugin]);
  // OpenEditorFactory.registerRenderPlugin([ Plugins.AutoScroll.AutoScrollRenderPlugin ]);
}
