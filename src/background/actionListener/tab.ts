import {
  OperateTabEnum,
  IOperateTabData,
} from '@/isomorphic/background/tab';
import Chrome from '@/background/core/chrome';
import { ContentScriptEvents } from '@/isomorphic/event/contentScript';
import { RequestMessage } from './index';

export async function createTabActionListener(
  request: RequestMessage<IOperateTabData>,
  callback: (params: any) => void,
) {
  const { type, url } = request.data;
  switch (type) {
    case OperateTabEnum.screenShot: {
      const tabs = await Chrome.tabs.query({ lastFocusedWindow: true });
      const res = await Chrome.tabs.captureVisibleTab(tabs[0].windowId as number);
      callback(res);
      break;
    }
    case OperateTabEnum.getCurrent: {
      const tab = await Chrome.tabs.query({ lastFocusedWindow: true, active: true });
      callback(tab?.[0]);
      break;
    }
    case OperateTabEnum.create: {
      Chrome.tabs.create({ url });
      callback(true);
      break;
    }
    case OperateTabEnum.getDocument: {
      const res = await Chrome.sendMessageToCurrentTab({
        action: ContentScriptEvents.GetDocument,
      });
      callback(res);
      break;
    }
    default: {
      break;
    }
  }
}
