import { BackgroundEvents } from '@/isomorphic/background';
import { ICallBridgeImpl } from '../index';

export interface ICreateDocParams {
  title: string;
  book_id: number;
  body_draft_asl: string;
  body_asl: string;
  body: string;
  insert_to_catalog: boolean;
}

export function createDocProxy(impl: ICallBridgeImpl) {
  return {
    create: async (params: ICreateDocParams): Promise<{ id: number }> => {
      return new Promise((resolve, rejected) => {
        impl(
          BackgroundEvents.OperateRequest,
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
            if (res.status === 200) {
              resolve(res.data.data);
              return;
            }
            rejected(res);
          },
        );
      });
    },
  };
}
