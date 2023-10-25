import {
  OperateClipEnum,
  IOperateClipData,
} from '@/isomorphic/background/clip';
import Chrome from '@/background/core/chrome';
import { ContentScriptEvents } from '@/isomorphic/event/contentScript';
import { RequestMessage } from './index';

export async function createClipActionListener(
  request: RequestMessage<IOperateClipData>,
  callback: (params: any) => void,
) {
  const { type, isRunningInjectPage } = request.data;
  switch (type) {
    case OperateClipEnum.screenOcr: {
      const res = await Chrome.sendMessageToCurrentTab({
        action: ContentScriptEvents.ScreenOcr,
        data: {
          isRunningInjectPage,
        },
      });
      callback(res);
      break;
    }
    case OperateClipEnum.selectArea: {
      const res = await Chrome.sendMessageToCurrentTab({
        action: ContentScriptEvents.SelectArea,
        data: {
          isRunningInjectPage,
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
