import { BackgroundEvents } from '@/isomorphic/background';
import { ICallBridgeImpl } from '../index';

export function createUploadProxy(impl: ICallBridgeImpl) {
  return {
    async attach(data: string) {
      return new Promise((resolve, rejected) => {
        impl(
          BackgroundEvents.OperateRequest,
          {
            url: '/api/upload/attach',
            config: {
              data,
            },
            options: {
              isFileUpload: true,
            },
          },
          res => {
            if (res.status === 200) {
              resolve(res?.data?.data);
              return;
            }
            rejected(res);
          },
        );
      });
    },
  };
}
