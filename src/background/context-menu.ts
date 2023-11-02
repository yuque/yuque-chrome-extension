import Chrome from '@/background/core/chrome';
import { ContentScriptEvents } from '@/isomorphic/event/contentScript';
import { __i18n } from '@/isomorphic/i18n';

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
  menuList.forEach(item => Chrome.contextMenus.create(item));
}

export function listenContextMenuEvents() {
  Chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab) return;

    switch (info.menuItemId) {
      case menuList[0].id: {
        const { selectionText } = info;
        Chrome.tabs.sendMessage(tab.id as number, {
          action: ContentScriptEvents.AddContentToClipAssistant,
          data: `${selectionText}<br/>`,
        });
        break;
      }
      case menuList[1].id:
        Chrome.tabs.sendMessage(tab.id as number, {
          action: ContentScriptEvents.ToggleSidePanel,
        });
        break;
      case menuList[2].id: {
        const { srcUrl } = info;
        Chrome.tabs.sendMessage(tab.id as number, {
          action: ContentScriptEvents.AddContentToClipAssistant,
          data: `<img src=${srcUrl} />`,
        });
        break;
      }
      default:
        break;
    }
  });
}
