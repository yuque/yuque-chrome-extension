import { BackgroundEvents } from '@/isomorphic/background';
import { OperateClipEnum } from '@/isomorphic/background/clip';
import { ICallBridgeImpl } from './index';

export function createClipBridge(impl: ICallBridgeImpl) {
  return {
    clip: {
      async screenOcr(): Promise<string | null> {
        return new Promise(resolve => {
          impl(
            BackgroundEvents.OperateClip,
            { type: OperateClipEnum.screenOcr },
            (res: string | null) => {
              resolve(res);
            },
          );
        });
      },

      async selectArea(): Promise<string> {
        return new Promise(resolve => {
          impl(
            BackgroundEvents.OperateClip,
            { type: OperateClipEnum.selectArea },
            (res: string) => {
              resolve(res);
            },
          );
        });
      },
    },
  };
}
