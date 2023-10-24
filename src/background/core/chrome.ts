const {
  action,
  cookies,
  contextMenus,
  runtime,
  storage,
  tabs,
  webRequest,
  declarativeNetRequest,
  windows,
  downloads,
  scripting,
  commands,
} = global.chrome;

export default {
  action,
  cookies,
  contextMenus,
  runtime,
  storage,
  tabs,
  webRequest,
  declarativeNetRequest,
  windows,
  downloads,
  scripting,
  commands,
  sendMessageToCurrentTab: (message: any) =>
    new Promise(resolve => {
      tabs.query({ active: true, lastFocusedWindow: true }, res => {
        const tabId = res[0]?.id;
        if (!tabId) {
          resolve(null);
          return;
        }
        tabs.sendMessage(tabId, message, res1 => {
          resolve(res1);
        });
      });
    }),
  sendMessageToAllTab: (message: any) => {
    new Promise(resolve => {
      tabs.query({ status: 'complete' }, res => {
        for (const tab of res) {
          if (tab.id) {
            tabs.sendMessage(tab.id, message, res1 => {
              resolve(res1);
            });
          }
        }
      });
    });
  },
};
