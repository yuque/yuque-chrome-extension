import request, { uploadFile } from '@/core/request';
import { YUQUE_DOMAIN } from '@/config';
import { Book } from './interface';

export const SERVER_URLS = {
  LOGOUT: `${YUQUE_DOMAIN}/logout`,
  LOGIN: `${YUQUE_DOMAIN}/api/accounts/login`,
  DASHBOARD: `${YUQUE_DOMAIN}/dashboard`,
};

interface NoteUpdateParams {
  id: number;
  html: string;
  source: string;
  abstract: string;
  real_save_type?: number;
  has_image?: boolean;
  has_bookmark?: boolean;
  has_attachment?: boolean;
  sync_dynamic_data?: boolean;
  latest_update_user_uuid?: string;
  word_count?: number;
}

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
    async getStatus() {
      return await request('/api/modules/note/notes/NoteController/status', {
        method: 'GET',
      });
    },
    async update(params: NoteUpdateParams) {
      const time = new Date().getTime();
      return await request('/api/modules/note/notes/NoteController/update', {
        method: 'PUT',
        data: {
          save_type: 'user',
          published_at: time,
          content_updated_at: time,
          ...params,
        },
      });
    },
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
  upload: {
    async attach(file, attachableId) {
      const { status, data } = await uploadFile(
        '/api/upload/attach',
        file,
        attachableId,
      );
      if (status === 200) {
        return data;
      }
      throw new Error(`Error uploading image: ${(data as any).statusText}`);
    },
  },
  wordMark: {
    async translate(srcTextList: string[]) {
      const isChinese = !!srcTextList[0].match(/[一-龥]/);
      return await request('/api/services/translate/text', {
        method: 'POST',
        data: {
          srcLanguage: isChinese ? 'zh' : 'en',
          srcTextList,
          tgtLanguage: isChinese ? 'en' : 'zh',
        },
      });
    },
  },
};

export default RequestProxy;
