import chromeExtension from './core/chromeExtension';

export function listenBrowserActionEvent() {
  chrome.action.onClicked.addListener(async tab => {
    const currentTab = await chromeExtension.tabs.getCurrentTab(tab);
    chromeExtension.scripting.executeScript(
      {
        target: { tabId: currentTab?.id as number },
        func: () => {
          try {
            return window._yuque_ext_app.toggleSidePanel();
          } catch (e) {
            return { error: e };
          }
        },
      },
      res => {
        if (res[0]?.result?.error) {
          const msg = __i18n('你需要重新加载该页面才能剪藏。请重新加载页面后再试一次');
          chromeExtension.scripting.executeScript({
            target: { tabId: currentTab?.id as number },
            args: [{ msg }],
            func: (args: { msg: string }) => {
              window.alert(args.msg); // eslint-disable-line
            },
          });
        }
      },
    );
  });
}
