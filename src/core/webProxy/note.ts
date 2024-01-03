import { httpProxy } from './base';

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

export function createNoteProxy() {
  return {
    create: async (params: NoteCreateParams) => {
      const time = new Date().getTime();
      return new Promise((resolve, reject) => {
        httpProxy.sendMethodCallToBackground(
          {
            url: '/api/modules/note/notes/NoteController/create',
            config: {
              method: 'POST',
              data: {
                save_type: 'user',
                save_from: 'yuque-chrome-extension',
                published_at: time,
                content_updated_at: time,
                ...params,
              },
            },
          },
          res => {
            if (res.status !== 200) {
              reject(res);
              return;
            }
            resolve(res.data);
            return;
          },
        );
      });
    },
  };
}
