import request from '@/core/request';
import { Book } from '../interface';

export const mineProxy = {
  async getUserInfo(options = {}) {
    const { data, status } = await request<any>('/api/mine', {
      method: 'GET',
      ...options,
    });
    if (status === 200) {
      return data.data;
    }
  },
  async getBooks() {
    const { data } = await request<{ data: Book[] }>(
      '/api/mine/personal_books',
      {
        method: 'GET',
        data: {
          limit: 200,
          offset: 0,
        },
      },
    );
    return Array.isArray(data?.data)
      ? // 过滤掉非文档类型的知识库
      data.data.filter(b => b.type === 'Book')
      : [];
  },
};
