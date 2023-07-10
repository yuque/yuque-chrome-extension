import Chrome from '@/core/chrome';
import { GLOBAL_EVENTS } from '@/events';

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
      return __i18n('语雀插件');
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
        const { pageUrl, selectionText } = info;
        Chrome.tabs.sendMessage(tab.id, {
          action: GLOBAL_EVENTS.SAVE_TO_NOTE,
          pageUrl,
          selectionText,
        });
        break;
      }
      case menuList[1].id:
        Chrome.tabs.sendMessage(tab.id, {
          action: GLOBAL_EVENTS.SHOW_BOARD,
        });
        break;
      case menuList[2].id: {
        const { srcUrl } = info;
        Chrome.tabs.sendMessage(tab.id, {
          action: GLOBAL_EVENTS.SAVE_TO_NOTE_IMAGE,
          srcUrl,
        });
        break;
      }
      default:
        break;
    }
  });
}
