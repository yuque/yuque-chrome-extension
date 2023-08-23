import { get as safeGet } from 'lodash';
import {
  BIG_DOCUMENT_BLOCK_COUNT,
  DESCRIPTION_MAX_LENGTH,
  SUMMARY_PARAGRAPH_MAX_COUNT,
} from '@/isomorphic/constants';

interface ExtractSummaryRawOption {
  maxHtmlTextLength?: number;
  summary: string;
}

export const extractSummaryRaw = (
  content: string,
  options: ExtractSummaryRawOption,
) => {
  let { maxHtmlTextLength = DESCRIPTION_MAX_LENGTH - 100, summary } = options;
  let metaTag = content.match(/^\s*<([^>]+)>/);
  const lakeIdUnRemoveAbleNodeNames = [ 'LI', 'CARD' ];
  let metaStr = '';
  const summaryEqualContent = !summary || summary === content;

  while (
    metaTag &&
    (metaTag[1].startsWith('!') || metaTag[1].startsWith('meta'))
  ) {
    const len = metaTag[0].length;
    metaStr += metaTag[0];
    content = content.substr(len);
    metaTag = content.match(/^\s*<([^>]+)>/);
  }

  const fullDocument = new DOMParser().parseFromString(content, 'text/html');

  const isBigDocument =
    fullDocument.body.childNodes.length > BIG_DOCUMENT_BLOCK_COUNT;
  let hasImage = !!fullDocument.body.querySelector('card[name="image"]');
  const hasTodo = !!fullDocument.body.querySelector('card[name="checkbox"]');
  const hasBookmark = !!fullDocument.body.querySelector(
    'card[name="bookmarklink"]',
  );
  const hasAttachment = !!fullDocument.body.querySelector(
    'card[name="file"],card[name="localdoc"]',
  );

  const summaryDocument = summaryEqualContent
    ? fullDocument
    : new DOMParser().parseFromString(summary, 'text/html');
  const { body } = summaryDocument;
  const summaryCount = SUMMARY_PARAGRAPH_MAX_COUNT;

  let summaryHTML = metaStr;
  if (maxHtmlTextLength) {
    maxHtmlTextLength -= metaStr.length;
  }

  let extractCount = 0;
  let contentOverflow = false;
  const OVERFLOW_TIP = "<p>---'首段内容太长，无法截取摘要'---</p>";

  // 移除超过段落数量的节点
  let removeNode = body.childNodes[summaryCount];
  while (removeNode) {
    const nextNode = removeNode.nextSibling;
    removeNode.remove();
    removeNode = nextNode;
  }

  // 移除不必要的属性，让摘要信息更加精简
  const allNodes = body.querySelectorAll('*');
  allNodes.forEach(node => {
    if (node.nodeName === 'CARD') {
      const cardName = node.getAttribute('name');

      if (cardName === 'bookmarklink') {
        const value = node.getAttribute('value');
        if (value) {
          try {
            const data = JSON.parse(decodeURIComponent(value.slice(5)));
            const icon = safeGet(data, 'detail.icon') || '';
            const image = safeGet(data, 'detail.image') || '';
            if (icon.startsWith('data:')) {
              data.detail.icon = '';
            }
            if (image.startsWith('data:')) {
              data.detail.image = '';
            }
            node.setAttribute(
              'value',
              `data:${encodeURIComponent(JSON.stringify(data))}`,
            );
          } catch (e) {
            node.remove();
          }
        }
      }

      if (cardName === 'image') {
        const value = node.getAttribute('value');
        if (value) {
          try {
            const data = JSON.parse(decodeURIComponent(value.slice(5)));
            delete data.ocrLocations;
            delete data.search;
            node.setAttribute(
              'value',
              `data:${encodeURIComponent(JSON.stringify(data))}`,
            );
          } catch (e) {
            node.remove();
          }
        }
      }

      if (cardName === 'board') {
        const value = node.getAttribute('value');
        if (value) {
          try {
            const data = JSON.parse(decodeURIComponent(value.slice(5)));

            // 有图片地址,则替换成图片,否则,保持不变
            if (data.src) {
              const imageData = {
                src: data.src,
              };

              node.setAttribute('name', 'image');
              node.setAttribute('type', 'inline');
              node.setAttribute(
                'value',
                `data:${encodeURIComponent(JSON.stringify(imageData))}`,
              );

              const pNode = summaryDocument.createElement('p');

              node.parentNode.replaceChild(pNode, node);
              pNode.appendChild(node);

              hasImage = true;
            }
          } catch (e) {
            node.remove();
          }
        }
      }
    }
    if (!lakeIdUnRemoveAbleNodeNames.includes(node.nodeName)) {
      node.removeAttribute('id');
      node.removeAttribute('data-lake-id');
    }
  });
  for (let i = 0; i < body.childNodes.length; i++) {
    const node = body.childNodes[i] as Element;
    if (summaryHTML.length + node.outerHTML.length > maxHtmlTextLength) {
      if (i === 0) {
        // 第一个节点就超限时，要逐个清理节点
        let clearNode: any = node;
        if (node.nodeName === 'TABLE') {
          clearNode = node.querySelector('tbody');
        }
        while (
          clearNode.lastChild &&
          summaryHTML.length + node.outerHTML.length > maxHtmlTextLength
        ) {
          if (clearNode.lastChild !== clearNode.firstChild) {
            clearNode.lastChild.remove();
          } else if (clearNode.firstChild.nodeType === Node.ELEMENT_NODE) {
            clearNode = clearNode.firstChild;
          } else {
            const cutLength =
              summaryHTML.length + node.outerHTML.length - maxHtmlTextLength;
            clearNode.firstChild.data = `${clearNode.firstChild.data.substr(
              0,
              Math.max(0, clearNode.firstChild.data.length - cutLength - 3),
            )}...`;
          }
        }
        if (clearNode.lastChild) {
          extractCount++;
          summaryHTML += node.outerHTML;
        } else {
          summaryHTML += OVERFLOW_TIP;
        }
      }
      contentOverflow = true;
      break;
    }
    extractCount++;
    summaryHTML += node.outerHTML;
  }

  const isFull =
    !contentOverflow &&
    extractCount === fullDocument.body.childNodes.length &&
    summaryEqualContent;

  return {
    extractCount,
    html: summaryHTML,
    isFull,
    isBigDocument,
    hasImage,
    hasTodo,
    hasBookmark,
    hasAttachment,
  };
};
