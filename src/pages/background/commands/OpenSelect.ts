import Chrome from '@/core/chrome';
import { GLOBAL_EVENTS } from '@/events';

export const OpenSelect = (tab: chrome.tabs.Tab, type: string) => {
  Chrome.tabs.sendMessage(tab.id, {
    action: GLOBAL_EVENTS.TRY_START_SELECT,
    payload: {
      type,
    },
  });
};
