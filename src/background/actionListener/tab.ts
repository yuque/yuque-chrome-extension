import {
  OperateTabEnum,
  IOperateTabData,
} from '@/isomorphic/background/tab';
import Chrome from '@/core/chrome';
import { RequestMessage } from './index';

export async function createTabActionListener(
  request: RequestMessage<IOperateTabData>,
  callback: (params: any) => void,
) {
  const { type } = request.data;
  switch (type) {
    case OperateTabEnum.screenShot: {
      const tabs = await Chrome.tabs.query({ lastFocusedWindow: true })
      const res =  await Chrome.tabs.captureVisibleTab(tabs[0].windowId as number);
      callback(res);
      break;
    }
    case OperateTabEnum.getCurrent: {
      const tab = await Chrome.tabs.query({ lastFocusedWindow: true, active: true });
      callback(tab?.[0]);
      break;
    }
    default: {
      break;
    }
  }
}
