import { BackgroundEvents } from '@/isomorphic/background';
import { ICallBridgeImpl } from '../index';

export interface ITag {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export function createTagProxy(impl: ICallBridgeImpl) {
  return {
    async index(): Promise<ITag[]> {
      return new Promise((resolve, rejected) => {
        impl(
          BackgroundEvents.OperateRequest,
          {
            url: '/api/modules/note/tags/TagController/index',
            config: {
              method: 'GET',
            },
          },
          res => {
            if (res.status === 200) {
              resolve(res?.data?.data || []);
              return;
            }
            rejected(res);
          },
        );
      });
    },
    async create(params: { name: string }): Promise<ITag | null> {
      return new Promise((resolve, rejected) => {
        impl(
          BackgroundEvents.OperateRequest,
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
            if (res.status === 200) {
              resolve(res?.data || null);
              return;
            }
            rejected(res);
          },
        );
      });
    },
  };
}
