import { getMsgId } from '@/isomorphic/util';

const chromeExtension = {
  action: chrome.action,
  cookies: chrome.cookies,
  contextMenus: chrome.contextMenus,
  runtime: chrome.runtime,
  storage: chrome.storage,
  tabs: {
    ...chrome.tabs,
    getCurrentTab: async (tab?: chrome.tabs.Tab) => {
      if (tab?.id) {
        return tab;
      }
      const tabs = await chrome.tabs.query({ lastFocusedWindow: true, active: true });
      return tabs[0];
    },
    sendMessageToCurrentTab: async (message: any, tab?: chrome.tabs.Tab) => {
      const currentTab = await chromeExtension.tabs.getCurrentTab(tab);
      const response = await chrome.tabs.sendMessage(currentTab.id as number, message);
      return response;
    },
    sendMessageToAllTab: async (message: any) => {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id as number, message);
        } catch (error) {
          // 吞掉错误
        }
      }
    },
    async sendToContent(tab: chrome.tabs.Tab, type: string, data: any, id?: string) {
      const params = {
        type,
        data,
        id: id || getMsgId({ type }),
      };
      chrome.tabs.sendMessage(tab.id as number, params);
    },
  },
  webRequest: chrome.webRequest,
  declarativeNetRequest: chrome.declarativeNetRequest,
  windows: chrome.windows,
  downloads: chrome.downloads,
  scripting: chrome.scripting,
  commands: chrome.commands,
  sendMessageToCurrentTab: (message: any) =>
    new Promise(resolve => {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, res => {
        const tabId = res[0]?.id;
        if (!tabId) {
          resolve(null);
          return;
        }
        chrome.tabs.sendMessage(tabId, message, res1 => {
          resolve(res1);
        });
      });
    }),
  sendMessageToAllTab: (message: any) => {
    new Promise(resolve => {
      chrome.tabs.query({ status: 'complete' }, res => {
        for (const tab of res) {
          if (tab.id) {
            try {
              chrome.tabs.sendMessage(tab.id, message, res1 => {
                resolve(res1);
              });
            } catch (e) {
              // 吞掉抛错
            }
          }
        }
      });
    });
  },
};

export default chromeExtension;
