import React from 'react';
import { message } from 'antd';
import { extractSummaryRaw } from '@/components/editor/extract-summary-raw';
import { sendMessageToBack } from '@/core/bridge/inject-to-background';
import { BACKGROUND_EVENTS } from '@/events';
import { VIEW_MORE_TAG } from '@/isomorphic/constants';
import LinkHelper from '@/core/link-helper';
import { __i18n } from '@/isomorphic/i18n';
import { IEditorRef } from '../page/editor';

interface SaveOption {
  needThrowError?: boolean;
}

export async function saveToNote(
  editor: IEditorRef,
  tagIds: number[],
  option?: SaveOption,
) {
  const serializedAsiContent = (await editor.getContent('lake')) || '';
  const serializedHtmlContent = (await editor.getContent('text/html')) || '';
  const summary = await editor.getSummaryContent();
  const wordCount = await editor.wordCount();
  const extractRes = extractSummaryRaw(serializedAsiContent, {
    summary,
  });
  const {
    hasImage: has_image,
    hasBookmark: has_bookmark,
    hasAttachment: has_attachment,
    isFull,
  } = extractRes;
  let description = extractRes.html;
  // 摘要与内容不相等，展示更多标记
  if (!isFull) {
    description += VIEW_MORE_TAG;
  }

  try {
    await sendMessageToBack(BACKGROUND_EVENTS.SAVE_TO_NOTE, {
      source: serializedAsiContent,
      html: serializedHtmlContent,
      abstract: description,
      has_image,
      has_bookmark,
      has_attachment,
      word_count: wordCount,
      tag_meta_ids: tagIds,
    });
    const url = LinkHelper.goMyNote();
    message.success(
      <span>
        {__i18n('保存成功！')}
        &nbsp;&nbsp;
        <a target="_blank" href={url}>
          {__i18n('去小记查看')}
        </a>
      </span>,
    );
  } catch (error) {
    message.error(__i18n('保存失败，请重试！'));
    if (option?.needThrowError) {
      throw error;
    }
  }
}

export async function saveToBook(
  editor: IEditorRef,
  bookId: number,
  option?: SaveOption,
) {
  const serializedAsiContent = (await editor.getContent('lake')) || '';
  const serializedHtmlContent = (await editor.getContent('text/html')) || '';
  try {
    const doc = await sendMessageToBack(BACKGROUND_EVENTS.SAVE_TO_BOOK, {
      title: __i18n('[来自剪藏] {title}', {
        title: document.title,
      }),
      book_id: bookId,
      body_draft_asl: serializedAsiContent,
      body_asl: serializedAsiContent,
      body: serializedHtmlContent,
      insert_to_catalog: true,
    });
    const url = LinkHelper.goDoc(doc);
    message.success(
      <span>
        {__i18n('保存成功！')}
        &nbsp;&nbsp;
        <a target="_blank" href={url}>
          {__i18n('立即查看')}
        </a>
      </span>,
    );
  } catch (error) {
    message.error(__i18n('保存失败，请重试！'));
    if (option?.needThrowError) {
      throw error;
    }
  }
}
