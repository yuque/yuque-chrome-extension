import { httpProxy } from './base';

export interface ITag {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export function createTagProxy() {
  return {
    index: async (): Promise<ITag[]> => {
      return new Promise((resolve, reject) => {
        httpProxy.sendMethodCallToBackground(
          {
            url: '/api/modules/note/tags/TagController/index',
            config: {
              method: 'GET',
            },
          },
          res => {
            if (res.status !== 200) {
              reject(res);
              return;
            }
            resolve(res?.data?.data || []);
            return;
          },
        );
      });
    },
    create: async (params: { name: string }): Promise<ITag> => {
      return new Promise((resolve, reject) => {
        httpProxy.sendMethodCallToBackground(
          {
            url: '/api/modules/note/tags/TagController/create',
            config: {
              method: 'POST',
              data: {
                ...params,
                create_or_find: true,
              },
            },
          },
          res => {
            if (res.status !== 200) {
              reject(res);
              return;
            }
            resolve(res.data);
            return;
          },
        );
      });
    },
  };
}
