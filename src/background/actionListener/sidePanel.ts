import { OperateSidePanelEnum, IOperateSidePanelData } from '@/isomorphic/background/sidePanel';
import chromeExtension from '../core/chromeExtension';
import { RequestMessage } from './index';

export async function createSidePanelActionListener(
  request: RequestMessage<IOperateSidePanelData>,
  callback: (params: any) => void,
  sender: chrome.runtime.MessageSender,
) {
  const { type } = request.data;
  const currentTab = await chromeExtension.tabs.getCurrentTab(sender.tab);
  switch (type) {
    case OperateSidePanelEnum.close: {
      chromeExtension.scripting.executeScript(
        {
          target: { tabId: currentTab?.id as number },
          func: () => {
            return window._yuque_ext_app.toggleSidePanel(false);
          },
        },
        res => {
          callback(res[0]?.result);
        },
      );
      break;
    }
    case OperateSidePanelEnum.open: {
      chromeExtension.scripting.executeScript(
        {
          target: { tabId: currentTab?.id as number },
          func: () => {
            return window._yuque_ext_app.toggleSidePanel(true);
          },
        },
        res => {
          callback(res[0]?.result);
        },
      );
      break;
    }
    default: {
      break;
    }
  }
}
