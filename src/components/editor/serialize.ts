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
      case 'heading-one':
        return `<h1>${children}</h1>`;
      case 'heading-two':
        return `<h2>${children}</h2>`;
      case 'heading-three':
        return `<h3>${children}</h3>`;
      case 'heading-four':
        return `<h4>${children}</h4>`;
      case 'heading-five':
        return `<h5>${children}</h5>`;
      case 'heading-six':
        return `<h6>${children}</h6>`;
      default:
        return children;
    }
  } else {
    return '';
  }
};

export default serialize;
