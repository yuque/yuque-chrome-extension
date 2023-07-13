import escapeHtml from 'escape-html';
import {
  CustomElement,
  CustomText,
  isCustomElement,
  isCustomText,
} from './Editor';
import contentParser from './content-parser';

const wrapWith = (tag, content) => `<${tag}>${content}</${tag}>`;

const serializeCustomText = node => {
  let string = escapeHtml(node.text);

  if (node.bold) string = wrapWith('strong', string);
  if (node.italic) string = wrapWith('em', string);
  if (node.underline) string = wrapWith('u', string);
  if (node.code) string = wrapWith('code', string);

  return string;
};

const serializeCustomElement = (node, isASL) => {
  const children = node.children.map(child => serialize(child, isASL)).join('');

  const typeToTag = {
    'block-quote': wrapWith('blockquote', wrapWith('p', children)),
    paragraph: wrapWith('p', children),
    'heading-one': wrapWith('h1', children),
    'heading-two': wrapWith('h2', children),
    'heading-three': wrapWith('h3', children),
    'heading-four': wrapWith('h4', children),
    'heading-five': wrapWith('h5', children),
    'heading-six': wrapWith('h6', children),
    'numbered-list': wrapWith('ol', children),
    'list-item': wrapWith('li', children),
    'bulleted-list': wrapWith('ul', children),
  };

  if (node.type === 'link' && isASL) {
    return contentParser.createLakeAslByLinkDetail(
      escapeHtml(node.url),
      node.children[0]?.text,
    );
  } else if (node.type === 'image') {
    return isASL
      ? contentParser.createLakeAslByImageUrl(escapeHtml(node.url))
      : wrapWith('img src', `${escapeHtml(node.url)}" /`);
  }
  return typeToTag[node.type] || children;
};

const serialize = (
  node: CustomElement | CustomText,
  isASL: boolean = false,
): string => {
  if (isCustomText(node)) return serializeCustomText(node);
  if (isCustomElement(node)) return serializeCustomElement(node, isASL);

  return '';
};

export default serialize;
