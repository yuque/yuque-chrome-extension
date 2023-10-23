import { pick } from 'lodash';
import { BackgroundEvents } from '@/isomorphic/background';
import { ICallBridgeImpl } from '../index';

export interface ISavePosition {
  id: number;
  type: 'Book' | 'Note';
  name: string;
}

export const DefaultSavePosition: ISavePosition = {
  id: 0,
  type: 'Note',
  name: '保存小记',
};

export function createMineProxy(impl: ICallBridgeImpl) {
  return {
    getUserInfo: async (params = {}) => {
      return new Promise((resolve, rejected) => {
        impl(
          BackgroundEvents.OperateRequest,
          {
            url: '/api/mine',
            config: {
              method: 'GET',
              ...params,
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
    async getBooks(): Promise<Array<ISavePosition>> {
      return new Promise((resolve, rejected) => {
        impl(
          BackgroundEvents.OperateRequest,
          {
            url: '/api/mine/personal_books',
            config: {
              method: 'GET',
              data: {
                limit: 200,
                offset: 0,
              },
            },
          },
          res => {
            if (res.status === 200) {
              const result = res?.data?.data
                ?.map((item: any) => {
                  if (item.type !== 'Book') {
                    return null;
                  }
                  return pick(item, ['name', 'id', 'type']);
                })
                ?.filter((item: any) => !!item);
              resolve(result || []);
              return;
            }
            rejected(res);
          },
        );
      });
    },
  };
}
