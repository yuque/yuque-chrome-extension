export const slash = {
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
              childMenus: ['columns2', 'columns3', 'columns4'],
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
          items: ['codeblock', 'math'],
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
          items: ['label', 'math'],
        },
      ],
    },
  },
};
