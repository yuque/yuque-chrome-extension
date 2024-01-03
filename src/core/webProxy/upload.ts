import { httpProxy } from './base';

export function createUploadProxy() {
  return {
    async attach(data: string) {
      return new Promise((resolve, reject) => {
        httpProxy.sendMethodCallToBackground(
          {
            url: '/api/upload/attach',
            config: {
              data: typeof data === 'string' ? data : URL.createObjectURL(data),
            },
            options: {
              isFileUpload: true,
            },
          },
          res => {
            if (res.status !== 200) {
              reject(res);
              return;
            }
            resolve(res?.data?.data);
            return;
          },
        );
      });
    },
  };
}
