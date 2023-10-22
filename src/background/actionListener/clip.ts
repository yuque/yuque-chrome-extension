import { RequestMessage } from './index';
import {
  OperateClipEnum,
  IOperateClipData,
} from '@/isomorphic/background/clip';
import Chrome from '@/background/core/chrome';
import { ContentScriptEvents } from '@/isomorphic/contentScript';

export async function createClipActionListener(
  request: RequestMessage<IOperateClipData>,
  callback: (params: any) => void,
) {
  const { type } = request.data;
  switch (type) {
    case OperateClipEnum.screenOcr: {
      const res = await Chrome.sendMessageToCurrentTab({
        action: ContentScriptEvents.ScreenOcr,
      });

      callback(res);
      break;
    }
    case OperateClipEnum.selectArea: {
      const res = await Chrome.sendMessageToCurrentTab({
        action: ContentScriptEvents.SelectArea,
      });
      callback(res);
      break;
    }
    default: {
      break;
    }
  }
}
