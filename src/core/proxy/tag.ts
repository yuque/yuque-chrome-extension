import request from '@/core/request';

export interface ITag {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export const tagProxy = {
  async index() {
    return await request<{ data: ITag[] }>(
      '/api/modules/note/tags/TagController/index',
      {
        method: 'GET',
      },
    );
  },
  async create(params: { name: string }) {
    return await request<ITag>('/api/modules/note/tags/TagController/create', {
      method: 'POST',
      data: {
        ...params,
        create_or_find: true,
      },
    });
  },
};
