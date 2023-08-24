import React from 'react';
import { message } from 'antd';
import { __i18n } from '@/isomorphic/i18n';
import Chrome from '@/core/chrome';
import { BACKGROUND_EVENTS } from '@/events';
import LinkHelper from '@/core/link-helper';

interface SaveToNoteParams {
  source: string;
  html: string;
  abstract: string;
  has_image: boolean;
  has_bookmark: boolean;
  has_attachment: boolean;
  word_count: number;
}

export const saveToNote = async (params: SaveToNoteParams) => {
  const time = new Date().getTime();
  Chrome.runtime.sendMessage(
    {
      action: BACKGROUND_EVENTS.SAVE_TO_NOTE,
      data: {
        ...params,
        published_at: time,
        content_updated_at: time,
      },
    },
    res => {
      const url = LinkHelper.goMyNote();
      message.success(
        <span style={{ fontSize: '14px' }}>
          {__i18n('保存成功')}
          &nbsp;&nbsp;
          <a
            target="_blank"
            href={url}
            style={{
              color: '#1677ff',
              textDecoration: 'none',
            }}
          >
            {__i18n('去小记查看')}
          </a>
        </span>,
      );
    },
  );
};

interface SaveToBookParams {
  book_id: number;
  body_draft_asl: string;
  body_asl: string;
  body: string;
}

export const saveToBook = async (params: SaveToBookParams) => {
  Chrome.runtime.sendMessage(
    {
      action: BACKGROUND_EVENTS.SAVE_TO_BOOK,
      data: {
        ...params,
        insert_to_catalog: true,
        title: __i18n('[来自剪藏] {title}', { title: document.title }),
      },
    },
    res => {
      const url = LinkHelper.goDoc(res);
      message.success(
        <span style={{ fontSize: '14px' }}>
          {__i18n('保存成功！')}
          &nbsp;&nbsp;
          <a
            target="_blank"
            href={url}
            style={{
              color: '#1677ff',
              textDecoration: 'none',
            }}
          >
            {__i18n('立即查看')}
          </a>
        </span>,
      );
    },
  );
};

