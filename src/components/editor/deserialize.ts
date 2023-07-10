import { jsx } from 'slate-hyperscript';

type JSXElement = ReturnType<typeof jsx>;
const deserialize = (el: Node): JSXElement | string | null => {
  if (el.nodeType === 3) {
    return (el as Text).textContent;
  } else if (el.nodeType !== 1) {
    return null;
  }

  const htmlElement = el as HTMLElement;
  let children: (JSXElement | string)[] = Array.from(
    htmlElement.childNodes,
  ).map(deserialize);

  if (children.length === 0) {
    children = [{ text: '' }];
  }

  switch (htmlElement.nodeName) {
    case 'BODY':
      return jsx('fragment', {}, children);
    case 'BR':
      return '\n';
    case 'BLOCKQUOTE':
      return jsx('element', { type: 'quote' }, children);
    case 'P':
      return jsx('element', { type: 'paragraph' }, children);
    case 'A':
      return jsx(
        'element',
        {
          type: 'link',
          url: htmlElement.getAttribute('href'),
        },
        children,
      );
    case 'IMG': // Handle the IMG element
      return jsx(
        'element',
        {
          type: 'image',
          url: htmlElement.getAttribute('src'),
          alt: htmlElement.getAttribute('alt'),
        },
        children,
      );
    default:
      return htmlElement.textContent || '';
  }
};

export default deserialize;
