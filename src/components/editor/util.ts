import {
  Editor as SlateEditor,
  Transforms,
  Text,
  Element as SlateElement,
} from 'slate';
import { CustomElement } from './Editor';
import { LIST_TYPES, TEXT_ALIGN_TYPES } from './constant';

export const encodeCardValue = (value): string => {
  let rst;
  try {
    rst = encodeURIComponent(JSON.stringify(value));
  } catch (e) {
    rst = '';
  }
  return `data:${rst}`;
};

export const isMarkActive = (editor, format) => {
  const { selection } = editor;
  if (selection) {
    const [ match ] = SlateEditor.nodes(editor, {
      at: selection,
      match: n => Text.isText(n) && n[format] === true,
    });
    return !!match;
  }
  return false;
};

export const isBlockActive = (editor, format, blockType = 'type') => {
  const { selection } = editor;
  if (!selection) return false;

  const [ match ] = Array.from(
    SlateEditor.nodes(editor, {
      at: SlateEditor.unhangRange(editor, selection),
      match: n =>
        !SlateEditor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    }),
  );

  return !!match;
};

export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);
  const { selection } = editor;

  if (selection) {
    Transforms.setNodes(
      editor,
      { [format]: isActive ? null : true },
      { match: Text.isText, split: true },
    );
  }
};

export const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type',
  );
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: node =>
      !SlateEditor.isEditor(node) &&
      SlateElement.isElement(node) &&
      LIST_TYPES.includes((node as CustomElement).type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });
  let newProperties: Partial<CustomElement>;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    };
  }
  Transforms.setNodes<CustomElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};
