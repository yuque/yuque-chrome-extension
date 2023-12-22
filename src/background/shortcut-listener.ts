import chromeExtension from '@/background/core/chromeExtension';

export function listenShortcut() {
  chromeExtension.commands.onCommand.addListener(async (command, tab) => {
    const currentTab = await chromeExtension.tabs.getCurrentTab(tab);
    switch (command) {
      case 'selectArea': {
        chromeExtension.scripting.executeScript({
          target: { tabId: currentTab.id as number },
          func: () => {
            return window._yuque_ext_app.clipSelectArea({
              formShortcut: true,
            });
          },
        });
        break;
      }
      case 'startOcr': {
        chromeExtension.scripting.executeScript({
          target: { tabId: currentTab.id as number },
          func: () => {
            return window._yuque_ext_app.clipScreenOcr({
              formShortcut: true,
            });
          },
        });
        break;
      }
      case 'clipPage': {
        chromeExtension.scripting.executeScript({
          target: { tabId: currentTab.id as number },
          func: () => {
            return window._yuque_ext_app.clipPage();
          },
        });
        break;
      }
      default:
        break;
    }
  });
}
