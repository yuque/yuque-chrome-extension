import request, { uploadFile } from '@/core/request';
import { YUQUE_DOMAIN } from '@/config';

export const SERVER_URLS = {
  LOGOUT: `${YUQUE_DOMAIN}/logout`,
  LOGIN: `${YUQUE_DOMAIN}/api/accounts/login`,
  DASHBOARD: `${YUQUE_DOMAIN}/dashboard`,
};

const RequestProxy = {
  async getMineInfo(options = {}) {
    const { data, status } = await request('/api/mine', {
      method: 'GET',
      ...options,
    });
    if (status === 200) {
      return data.data;
    }
  },
  doc: {
    async create(payload = {}) {
      const { data, status } = await request('/api/docs', {
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
      try {
        const { data } = await request('/api/mine/personal_books', {
          method: 'GET',
          data: {
            limit: 200,
            offset: 0,
          },
        });
        return data.data;
      } catch (error) {
        const err = new Error();
        err.html = error.response?.data?.html;
        throw err;
      }
    },
  },
  note: {
    async getStatus() {
      return await request('/api/notes/status', {
        method: 'GET',
      });
    },
    async update(id, params) {
      return await request(`/api/notes/${id}`, {
        method: 'PUT',
        data: {
          save_type: 'user',
          ...params,
        },
      });
    },
    async create(id, params) {
      return await request('/api/modules/note/notes/NoteController/create', {
        method: 'POST',
        data: {
          id,
          save_type: 'user',
          ...params,
        },
      });
    },
  },
  upload: {
    async attach(file, attachableId) {
      const { status, statusText, data } = await uploadFile('/api/upload/attach', file, attachableId);
      if (status === 200) {
        return data;
      }
      throw new Error(`Error uploading image: ${statusText}`);

    },
  },
};

export default RequestProxy;
