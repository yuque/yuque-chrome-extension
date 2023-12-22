import { OperateClipEnum, IOperateClipData } from '@/isomorphic/background/clip';
import chromeExtension from '@/background/core/chromeExtension';
import { RequestMessage } from './index';

export async function createClipActionListener(
  request: RequestMessage<IOperateClipData>,
  callback: (params: any) => void,
  sender: chrome.runtime.MessageSender,
) {
  const { type, isRunningHostPage } = request.data;
  const currentTab = await chromeExtension.tabs.getCurrentTab(sender.tab);
  switch (type) {
    case OperateClipEnum.screenOcr: {
      chromeExtension.scripting.executeScript(
        {
          target: { tabId: currentTab.id as number },
          args: [{ isRunningHostPage }],
          func: args => {
            return window._yuque_ext_app.clipScreenOcr({
              isRunningHostPage: args.isRunningHostPage,
            });
          },
        },
        res => {
          callback(res[0].result);
        },
      );
      break;
    }
    case OperateClipEnum.selectArea: {
      chromeExtension.scripting.executeScript(
        {
          target: { tabId: currentTab.id as number },
          args: [{ isRunningHostPage }],
          func: args => {
            return window._yuque_ext_app.clipSelectArea({
              isRunningHostPage: args.isRunningHostPage,
            });
          },
        },
        res => {
          callback(res[0].result);
        },
      );
      break;
    }
    case OperateClipEnum.clipPage: {
      chromeExtension.scripting.executeScript(
        {
          target: { tabId: currentTab?.id as number },
          func: () => {
            return window._yuque_ext_app.parsePage();
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
