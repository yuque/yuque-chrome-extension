import { httpProxy } from './base';

export interface ICreateDocParams {
  title: string;
  book_id: number;
  body_draft_asl: string;
  body_asl: string;
  body: string;
  insert_to_catalog: boolean;
}

export function createDocProxy() {
  return {
    create: async (params: ICreateDocParams): Promise<{ id: number }> => {
      return new Promise((resolve, reject) => {
        httpProxy.sendMethodCallToBackground(
          {
            url: '/api/docs',
            config: {
              method: 'POST',
              data: {
                type: 'Doc',
                format: 'lake',
                status: 1,
                ...params,
              },
            },
          },
          res => {
            if (!res.success) {
              reject(res);
              return;
            }
            resolve(res.data.data);
            return;
          },
        );
      });
    },
  };
}
