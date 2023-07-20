import Chrome from '@/core/chrome';
import { GLOBAL_EVENTS } from '@/events';

export function listenBrowserActionEvent() {
  Chrome.action.onClicked.addListener(tab => {
    Chrome.tabs.sendMessage(tab.id, {
      action: GLOBAL_EVENTS.SHOW_BOARD,
    });
  });
}
