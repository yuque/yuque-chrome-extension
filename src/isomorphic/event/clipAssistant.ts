// 选取剪藏元素的 id
export const ClipSelectAreaId = 'clip-select-area-id';

// ocr识别元素的 id
export const ClipScreenOcrId = 'clip-screen-ocr-id';

// ocr识别元素的 id
export const ClipCollectLinkId = 'clip-collect-link-id';

export const ClipAssistantMessageKey = 'ClipAssistantMessageKey';

export enum ClipAssistantMessageActions {
  /**
   * 笔记 ready 加载完成后通知的事件
   */
  ready = 'ready',
  addContent = 'addContent',
  startSelectArea = 'startSelectArea',
  startScreenOcr = 'startScreenOcr',
  startCollectLink = 'startCollectLink',
}
