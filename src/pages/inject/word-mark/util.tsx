import React from 'react';
import { message } from 'antd';
import { buildAsl } from '@/components/editor/build-asl';
import Chrome from '@/core/chrome';
import { BACKGROUND_EVENTS } from '@/events';
import LinkHelper from '@/core/link-helper';

export const saveToNote = (text: string) => {
  const source = buildAsl(text);
  const time = new Date().getTime();
  Chrome.runtime.sendMessage(
    {
      action: BACKGROUND_EVENTS.SAVE_TO_NOTE,
      data: {
        html: source,
        source,
        abstract: source,
        published_at: time,
        content_updated_at: time,
      },
    },
    res => {
      const url = LinkHelper.goMyNote();
      message.success(
        <span>
          {__i18n('保存成功')}
          &nbsp;&nbsp;
          <a target="_blank" href={url}>
            {__i18n('去小记查看')}
          </a>
        </span>,
      );
    },
  );
};
