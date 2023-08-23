import request from '@/core/request';

export interface NoteCreateParams {
  html: string;
  source: string;
  abstract: string;
  has_image?: boolean;
  has_bookmark?: boolean;
  has_attachment?: boolean;
  word_count?: number;
  tag_meta_ids?: number[];
}

export const noteProxy = {
  async create(params: NoteCreateParams) {
    const time = new Date().getTime();
    return await request('/api/modules/note/notes/NoteController/create', {
      method: 'POST',
      data: {
        save_type: 'user',
        save_from: 'yuque-chrome-extension',
        published_at: time,
        content_updated_at: time,
        ...params,
      },
    });
  },
};
