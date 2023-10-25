export enum EditorMessageType {
  /**
   * 追加html到文档
   */
  appendContent = 'appendContent',

  /**
   *  设置文档内容，将清空旧的内容
   */
  setContent = 'setContent',

  /**
   * 获取文档内容
   */
  getContent = 'getContent',

  /**
   * 判断当前文档是否是空文档
   */
  isEmpty = 'isEmpty',

  /**
   * 获取额外信息
   */
  getSummaryContent = 'getSummaryContent',

  /**
   * 统计字数
   */
  wordCount = 'wordCount',

  /**
   * 聚焦到文档开头
   * @return
   */
  focusToStart = 'focusToStart',

  /**
   * 插入换行符
   */
  insertBreakLine = 'insertBreakLine',
}

export const EditorMessageKey = 'editor';

export const EDITOR_IFRAME_CONTAINER_ID = 'editor-iframe-container-id';
