import { BackgroundEvents } from '@/isomorphic/background';
import { OperateClipEnum } from '@/isomorphic/background/clip';
import Env from '@/isomorphic/env';
import { ICallBridgeImpl } from './index';

export function createClipBridge(impl: ICallBridgeImpl) {
  return {
    clip: {
      async screenOcr(): Promise<string | null> {
        return new Promise(resolve => {
          impl(
            BackgroundEvents.OperateClip,
            { type: OperateClipEnum.screenOcr, isRunningHostPage: Env.isRunningHostPage },
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
            { type: OperateClipEnum.selectArea, isRunningHostPage: Env.isRunningHostPage },
            (res: string) => {
              resolve(res);
            },
          );
        });
      },

      async clipPage(): Promise<string> {
        return new Promise(resolve => {
          impl(
            BackgroundEvents.OperateClip,
            { type: OperateClipEnum.clipPage, isRunningHostPage: Env.isRunningHostPage },
            (res: string) => {
              resolve(res);
            },
          );
        });
      },

      async getImage(url: string): Promise<string> {
        return new Promise(resolve => {
          impl(BackgroundEvents.OperateClip, { type: OperateClipEnum.getImage, url }, (res: string) => {
            resolve(res);
          });
        });
      },
    },
  };
}
