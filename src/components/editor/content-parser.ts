import { encodeCardValue } from './util';

export default {
  createLakeAslByImageUrl: (
    imageUrl: string,
    width?: number,
    height?: number,
  ) => {
    if (!imageUrl) {
      return '';
    }
    const value = encodeCardValue({
      src: imageUrl,
      originWidth: width,
      originHeight: height,
    });
    return `<p><card type="inline" name="image" value="${value}"></card></p>`;
  },
  createLakeAslByLinkDetail: (linkUrl: string, linkTitle: string) => {
    const value = encodeCardValue({
      src: linkUrl,
      title: linkTitle,
      detail: {
        url: linkUrl,
        title: linkTitle,
      },
    });
    return `<!doctype lake><p><card type="block" name="bookmarklink" value="${value}"></card></p>`;
  },
  wrapLakeAslBody: (content: string) => {
    return `<!doctype lake><meta name="doc-version" content="1" /><meta name="viewport" content="adapt" /><meta name="typography" content="classic" />${content}`;
  },
  wrapLakeHtmlBody: (content: string) => {
    return `<div class="lake-content" typography="classic">${content}</div>`;
  },
};
