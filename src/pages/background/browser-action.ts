import Chrome from '@/core/chrome';
import { GLOBAL_EVENTS } from '@/events';

function remindToRefreshPage(tabId: number) {
  const msg = __i18n('你需要重新加载该页面才能剪藏。请重新加载页面后再试一次');
  Chrome.scripting.executeScript({
    target: { tabId },
    args: [{ msg }],
    func: (args: { msg: string }) => {
      window.alert(args.msg); // eslint-disable-line
    },
  });
}

export function listenBrowserActionEvent() {
  Chrome.action.onClicked.addListener(tab => {
    Chrome.tabs.sendMessage(tab.id, {
      action: GLOBAL_EVENTS.SHOW_BOARD,
    }, () => {
      /**
       * 插件更新后会断链接，需要提醒用户手动刷新下页面
       */
      if (Chrome.runtime.lastError?.message === 'Could not establish connection. Receiving end does not exist.') {
        remindToRefreshPage(tab.id);
      }
    });
  });
}
