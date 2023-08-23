import request from '@/core/request';

export interface ICreateDocParams {
  title: string;
  book_id: number,
  body_draft_asl: string;
  body_asl: string;
  body: string;
  insert_to_catalog: boolean;
}

export const docProxy = {
  async create(payload: ICreateDocParams) {
    const { data, status } = await request<any>('/api/docs', {
      method: 'POST',
      data: {
        type: 'Doc',
        format: 'lake',
        status: 1,
        ...payload,
      },
    });
    if (status === 200) {
      return data.data;
    }
  },
};
