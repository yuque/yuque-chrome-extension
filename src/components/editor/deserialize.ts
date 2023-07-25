import { jsx } from 'slate-hyperscript';

function nodeNameToHeadingJsx(nodeName: string, children: any[]) {
  return {
    H1: jsx('element', { type: 'heading-one' }, children),
    H2: jsx('element', { type: 'heading-two' }, children),
    H3: jsx('element', { type: 'heading-three' }, children),
    H4: jsx('element', { type: 'heading-four' }, children),
    H5: jsx('element', { type: 'heading-five' }, children),
    H6: jsx('element', { type: 'heading-six' }, children),
  }[nodeName];
}

type SlateJSXElement = ReturnType<typeof jsx>;
const deserialize = (el: Node): SlateJSXElement | string | null => {
  // 递归到 children 时直接返回 textContent string 格式
  if (el.nodeType === 3) {
    return (el as Text).textContent;
  } else if (el.nodeType !== 1) {
    return null;
  }

  const htmlElement = el as HTMLElement;
  let children: (SlateJSXElement | string)[] = Array.from(
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
    case 'H1':
    case 'H2':
    case 'H3':
    case 'H4':
    case 'H5':
    case 'H6':
      return nodeNameToHeadingJsx(htmlElement.nodeName, children);
    default:
      return jsx('element', { type: 'paragraph' }, [ htmlElement.textContent || '' ]);
  }
};

export default deserialize;
