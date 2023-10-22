import {
  OperateSidePanelEnum,
  IOperateSidePanelData,
} from '@/isomorphic/background/sidePanel';
import Chrome from '@/background/core/chrome';
import { ContentScriptEvents } from '@/isomorphic/contentScript';
import { RequestMessage } from './index';

export async function createSidePanelActionListener(
  request: RequestMessage<IOperateSidePanelData>,
  callback: (params: any) => void,
) {
  const { type } = request.data;
  switch (type) {
    case OperateSidePanelEnum.close: {
      const res = await Chrome.sendMessageToCurrentTab({
        action: ContentScriptEvents.ToggleSidePanel,
        data: {
          forceVisible: false,
        },
      });
      callback(res);
      break;
    }
    case OperateSidePanelEnum.open: {
      const res = await Chrome.sendMessageToCurrentTab({
        action: ContentScriptEvents.ToggleSidePanel,
        data: {
          forceVisible: true,
        },
      });
      callback(res);
      break;
    }
    default: {
      break;
    }
  }
}
