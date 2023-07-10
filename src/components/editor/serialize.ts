import { Text } from 'slate';
import escapeHtml from 'escape-html';
import { CustomElement } from './Editor';
import contentParser from './content-parser';

interface CustomText extends Text {
  bold?: boolean;
}

const serialize = (
  node: CustomElement | CustomText,
  isASL: boolean = false,
): string => {
  if (Text.isText(node)) {
    let string = escapeHtml(node.text);

    if (node.bold) {
      string = `<strong>${string}</strong>`;
    }

    return string;
  }

  const children = node.children
    .map(child => serialize(child as CustomElement, isASL))
    .join('');

  switch (node.type) {
    case 'quote':
      return `<blockquote><p>${children}</p></blockquote>`;
    case 'paragraph':
      return `<p>${children}</p>`;
    case 'link':
      return `<a href="${escapeHtml(node.url)}">${children}</a>`;
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
};

export default serialize;
