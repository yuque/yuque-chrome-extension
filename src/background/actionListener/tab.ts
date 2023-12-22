import { OperateTabEnum, IOperateTabData } from '@/isomorphic/background/tab';
import chromeExtension from '@/background/core/chromeExtension';
import { RequestMessage } from './index';

export async function createTabActionListener(
  request: RequestMessage<IOperateTabData>,
  callback: (params: any) => void,
  sender: chrome.runtime.MessageSender,
) {
  const { type, url, data } = request.data;
  const currentTab = await chromeExtension.tabs.getCurrentTab(sender.tab);
  switch (type) {
    case OperateTabEnum.screenShot: {
      const res = await chromeExtension.tabs.captureVisibleTab(currentTab.windowId as number);
      callback(res);
      break;
    }
    case OperateTabEnum.getCurrent: {
      callback(currentTab);
      break;
    }
    case OperateTabEnum.create: {
      chromeExtension.tabs.create({ url });
      callback(true);
      break;
    }
    case OperateTabEnum.getDocument: {
      const result = await chromeExtension.scripting.executeScript({
        target: { tabId: currentTab.id as number },
        func: () => {
          return {
            url: window.location.href,
            html: document.documentElement.outerHTML,
            title: document.title,
          };
        },
      });
      callback(result[0].result);
      break;
    }
    case OperateTabEnum.showMessage: {
      chromeExtension.scripting.executeScript({
        target: { tabId: currentTab.id as number },
        args: [{ config: data }],
        func: args => {
          return window._yuque_ext_app.showMessage(args.config);
        },
      });
      callback(true);
      break;
    }
    default: {
      break;
    }
  }
}
