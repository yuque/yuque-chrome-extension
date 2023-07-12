import { Text } from 'slate';
import escapeHtml from 'escape-html';
import {
  CustomElement,
  CustomText,
  isCustomElement,
  isCustomText,
} from './Editor';
import contentParser from './content-parser';

const serialize = (
  node: CustomElement | CustomText,
  isASL: boolean = false,
): string => {
  if (isCustomText(node)) {
    let string = escapeHtml(node.text);

    if (node.bold) {
      string = `<strong>${string}</strong>`;
    }

    return string;
  }

  if (isCustomElement(node)) {
    const children = node.children
      .map(child => serialize(child, isASL))
      .join('');

    switch (node.type) {
      case 'quote':
        return `<blockquote><p>${children}</p></blockquote>`;
      case 'paragraph':
        return `<p>${children}</p>`;
      case 'link':
        if (isASL) {
          const value = contentParser.createLakeAslByLinkDetail(
            escapeHtml(node.url),
            node.children[0]?.text,
          );
          return value;
        }
      case 'image':
        if (isASL) {
          const value = contentParser.createLakeAslByImageUrl(
            escapeHtml(node.url),
          );
          return value;
        } else {
          return `<img src="${escapeHtml(node.url)}" />`;
        }
      default:
        return children;
    }
  } else {
    return '';
  }
};

export default serialize;
