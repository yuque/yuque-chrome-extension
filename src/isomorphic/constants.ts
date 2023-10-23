import { YUQUE_DOMAIN } from '@/config';

export const SUMMARY_PARAGRAPH_MAX_COUNT = 10;
export const BIG_DOCUMENT_BLOCK_COUNT = 200;
export const DESCRIPTION_MAX_LENGTH = 5000;
export const VIEW_MORE_TAG = '<!-- note-viewmore -->';

// 划词操作类型
export enum WordMarkOptionTypeEnum {
  /**
   * 解释
   */
  explain = 'explain',
  /**
   * 翻译
   */
  translate = 'translate',
  /**
   * 摘要
   */
  summary = 'summary',
  /**
   * 剪藏
   */
  clipping = 'clipping',
}

// sandbox iframe id
export const YQ_SANDBOX_BOARD_IFRAME = 'yq-sandbox-board-iframe';

export const SERVER_URLS = {
  LOGOUT: `${YUQUE_DOMAIN}/logout`,
  LOGIN: `${YUQUE_DOMAIN}/api/accounts/login`,
  DASHBOARD: `${YUQUE_DOMAIN}/dashboard`,
};
