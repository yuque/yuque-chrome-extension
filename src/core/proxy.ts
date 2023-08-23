import request, { uploadFile } from '@/core/request';
import { YUQUE_DOMAIN } from '@/config';
import { Book } from './interface';

export const SERVER_URLS = {
  LOGOUT: `${YUQUE_DOMAIN}/logout`,
  LOGIN: `${YUQUE_DOMAIN}/api/accounts/login`,
  DASHBOARD: `${YUQUE_DOMAIN}/dashboard`,
};

const RequestProxy = {
  async getMineInfo(options = {}) {
    const { data, status } = await request<any>('/api/mine', {
      method: 'GET',
      ...options,
    });
    if (status === 200) {
      return data.data;
    }
  },
  doc: {
    async create(payload = {}) {
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
  },
  book: {
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
  },
  note: {
    async create(params) {
      return await request('/api/modules/note/notes/NoteController/create', {
        method: 'POST',
        data: {
          save_type: 'user',
          save_from: 'yuque-chrome-extension',
          ...params,
        },
      });
    },
  },
  tag: {
    async index() {
      return await request('/api/modules/note/tags/TagController/index', {
        method: 'GET',
      })
    },
    async create(params: { name: string }) {
      return await request('/api/modules/note/tags/TagController/create', {
        method: 'POST',
        data: {
          ...params,
          create_or_find: true,
        }
      })
    }
  },
  upload: {
    async attach(file) {
      const { status, data } = await uploadFile(
        '/api/upload/attach',
        file,
      );
      if (status === 200) {
        return data;
      }
      throw new Error(`Error uploading image: ${(data as any).statusText}`);
    },
  },
};

export default RequestProxy;
