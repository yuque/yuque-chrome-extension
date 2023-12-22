import { __i18n } from '@/isomorphic/i18n';
import chromeExtension from './core/chromeExtension';

interface MenuItem {
  id: string;
  title: string;
  contexts: chrome.contextMenus.ContextType[];
}

const menuList: MenuItem[] = [
  {
    id: 'save-to-yuque-notes',
    get title() {
      return __i18n('保存到语雀小记');
    },
    contexts: ['selection'],
  },
  {
    id: 'save-to-yuque',
    get title() {
      return __i18n('语雀插件');
    },
    contexts: ['page'],
  },
  {
    id: 'save-to-yuque-image',
    get title() {
      return __i18n('保存到语雀小记');
    },
    contexts: ['image'],
  },
];

export function createContextMenu() {
  menuList.forEach(item => chrome.contextMenus.create(item));
}

export function listenContextMenuEvents() {
  chromeExtension.contextMenus.onClicked.addListener(async (info, tab) => {
    const currentTab = await chromeExtension.tabs.getCurrentTab(tab);
    switch (info.menuItemId) {
      case menuList[0].id: {
        const { selectionText } = info;
        chromeExtension.scripting.executeScript({
          target: { tabId: currentTab?.id as number },
          args: [{ html: `${selectionText}<br/>` }],
          func: args => {
            window._yuque_ext_app.addContentToClipAssistant(args.html, true);
          },
        });
        break;
      }
      case menuList[1].id:
        chromeExtension.scripting.executeScript({
          target: { tabId: currentTab?.id as number },
          func: () => {
            return window._yuque_ext_app.toggleSidePanel();
          },
        });
        break;
      case menuList[2].id: {
        const { srcUrl } = info;
        chromeExtension.scripting.executeScript({
          target: { tabId: currentTab?.id as number },
          args: [{ html: `<img src=${srcUrl} />` }],
          func: args => {
            window._yuque_ext_app.addContentToClipAssistant(args.html, true);
          },
        });
        break;
      }
      default:
        break;
    }
  });
}
