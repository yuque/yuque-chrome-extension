import { get as safeGet } from 'lodash';
import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import {
  Slate,
  Editable,
  ReactEditor,
  withReact,
  useSelected,
  useFocused,
} from 'slate-react';
import {
  Editor as SlateEditor,
  Transforms,
  Range,
  Point,
  createEditor,
  Element as SlateElement,
  Node,
} from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import proxy from '@/core/proxy';
import Toolbar from './Toolbar';

interface CustomEditorProps {
  defaultValue?: Node[];
  onLoad: (editor: SlateEditor) => void;
}

interface ExtendedElementProps extends ElementProps {
  editor: ReactEditor & HistoryEditor;
}

interface ImageElementProps extends ExtendedElementProps {}

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  return <span {...attributes}>{children}</span>;
};

const ImageElement: React.FC<ImageElementProps> = ({
  attributes,
  children,
  element,
  editor,
}) => {
  const path = ReactEditor.findPath(editor, element);
  const selected = useSelected();
  const focused = useFocused();

  const handleDeleteMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleDeleteMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    Transforms.removeNodes(editor, {
      at: path,
      match: n => isImageElement(n),
    });
  };

  return (
    <div {...attributes}>
      {children}
      <div contentEditable={false} style={{ position: 'relative' }}>
        <img
          src={element.url}
          alt=""
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: '20em',
            boxShadow: selected && focused ? '0 0 0 3px #B4D5FF' : 'none',
          }}
        />
        <button
          onMouseDown={handleDeleteMouseDown}
          onMouseUp={handleDeleteMouseUp}
          style={{
            display: selected && focused ? 'inline' : 'none',
            position: 'absolute',
            top: '0.5em',
            left: '0.5em',
            backgroundColor: 'white',
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export interface CustomElement extends SlateElement {
  type: string;
  align?: string;
  url?: string;
  bold?: boolean;
}

interface ElementProps {
  attributes: any;
  children: React.ReactNode;
  element: CustomElement;
}

const SHORTCUTS: { [key: string]: string } = {
  '*': 'list-item',
  '-': 'list-item',
  '+': 'list-item',
  '>': 'block-quote',
  '#': 'heading-one',
  '##': 'heading-two',
  '###': 'heading-three',
  '####': 'heading-four',
  '#####': 'heading-five',
  '######': 'heading-six',
};

export const isCustomElement = (node: Node): node is CustomElement => {
  return (
    !SlateEditor.isEditor(node) &&
    SlateElement.isElement(node) &&
    'type' in node &&
    typeof node.type === 'string'
  );
};

const isImageElement = (
  node: Node,
): node is CustomElement & { type: 'image' } => {
  return isCustomElement(node) && node.type === 'image';
};

const withImages = (editor: ReactEditor & HistoryEditor) => {
  const { insertData, isVoid } = editor;

  editor.isVoid = element => {
    return isCustomElement(element) && element.type === 'image'
      ? true
      : isVoid(element);
  };

  editor.insertData = async (data: DataTransfer) => {
    const text = data.getData('text/plain');
    const { files } = data;

    if (files && files.length > 0) {
      // Fetch the note status to get the noteId
      const noteStatusResponse = await proxy.note.getStatus();
      const noteId = safeGet(noteStatusResponse, 'data.meta.mirror.id');

      if (!noteId) {
        console.error('Error fetching note status or noteId not found.');
        return;
      }
      for (const file of files) {
        const reader = new FileReader();
        const [mime] = file.type.split('/');

        if (mime === 'image') {
          reader.addEventListener('load', async () => {
            const url = reader.result;
            if (typeof url === 'string') {
              try {
                const jsonResponse = await proxy.upload.attach(file, noteId);
                const uploadedImageUrl = safeGet(jsonResponse, 'data.url');
                insertImage(editor, uploadedImageUrl);
              } catch (error) {
                console.error('Error uploading image:', error.message);
              }
            }
          });

          reader.readAsDataURL(file);
        }
      }
    } else {
      insertData(data);
    }
  };

  return editor;
};

export const insertImage = (
  editor: ReactEditor & HistoryEditor,
  url: string,
) => {
  const image: CustomElement = {
    type: 'image',
    url,
    children: [{ text: '' }],
  };
  Transforms.insertNodes(editor, image);
};

const withShortcuts = (editor: ReactEditor & HistoryEditor) => {
  const { deleteBackward, insertText } = editor;

  editor.insertText = text => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = SlateEditor.above(editor, {
        match: n => SlateEditor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const start = SlateEditor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = SlateEditor.string(editor, range);
      const type = SHORTCUTS[beforeText];

      if (type) {
        Transforms.select(editor, range);
        Transforms.delete(editor);
        const newProperties: Partial<CustomElement> = {
          type,
        };
        Transforms.setNodes(editor, newProperties, {
          match: n => SlateEditor.isBlock(editor, n),
        });

        if (type === 'list-item') {
          const list = {
            type: 'bulleted-list',
            children: [],
          };
          Transforms.wrapNodes(editor, list, {
            match: n => isCustomElement(n) && n.type === 'list-item',
          });
        }

        return;
      }
    }

    insertText(text);
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = SlateEditor.above(editor, {
        match: n => SlateEditor.isBlock(editor, n),
      });

      if (match) {
        const [block, path] = match;
        const start = SlateEditor.start(editor, path);

        if (
          isCustomElement(block) &&
          block.type !== 'paragraph' &&
          Point.equals(selection.anchor, start)
        ) {
          const newProperties: Partial<CustomElement> = {
            type: 'paragraph',
          };
          Transforms.setNodes(editor, newProperties);

          if (block.type === 'list-item') {
            Transforms.unwrapNodes(editor, {
              match: n =>
                isCustomElement(n) &&
                (n.type === 'bulleted-list' || n.type === 'numbered-list'), // Update this line
              split: true,
            });
          }

          return;
        }
      }

      deleteBackward(...args);
    }
  };

  return editor;
};

const Element = (props: ExtendedElementProps) => {
  const { attributes, children, element, editor } = props;
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>;
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>;
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>;
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>;
    case 'heading-three':
      return <h3 {...attributes}>{children}</h3>;
    case 'heading-four':
      return <h4 {...attributes}>{children}</h4>;
    case 'heading-five':
      return <h5 {...attributes}>{children}</h5>;
    case 'heading-six':
      return <h6 {...attributes}>{children}</h6>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'link':
      return (
        <a {...attributes} href={element.url}>
          {children}
        </a>
      );
    case 'image':
      return (
        <ImageElement
          attributes={attributes}
          children={children}
          element={element}
          editor={editor}
        />
      );
    case 'code':
      return (
        <pre {...attributes}>
          <code>{children}</code>
        </pre>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const useViewModel = (props: CustomEditorProps) => {
  const [value, setValue] = useState([]);
  const editor = useMemo(
    () =>
      withImages(
        withShortcuts(
          withReact(withHistory(createEditor() as ReactEditor & HistoryEditor)),
        ),
      ),
    [],
  );
  useEffect(() => {
    props.onLoad(editor);
  }, []);
  useEffect(() => {
    setValue(props.defaultValue);
  }, [props.defaultValue]);
  const onChange = value => {
    setValue(value);
  };
  return {
    state: {
      value,
    },
    editor,
    onChange,
  };
};

const CustomEditor: React.FC<CustomEditorProps> = props => {
  const {
    state: { value },
    editor,
    onChange,
  } = useViewModel(props);

  const [firstRender, setFirstRender] = useState(true);

  const editorContainerRef = useRef(null);

  function getClickedRow(event) {
    const editorRect = editorContainerRef.current.getBoundingClientRect();
    const computedStyle = getComputedStyle(editorContainerRef.current);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const clickY = event.clientY - editorRect.bottom + 1;
    const row = Math.floor(clickY / lineHeight);
    const column = 0;
    return { row, column };
  }

  const renderElement = useCallback(
    elementProps => (
      <Element
        editor={editor}
        attributes={elementProps.attributes}
        children={elementProps.children}
        element={elementProps.element}
      />
    ),
    [editor],
  );

  const renderLeaf = useCallback(props => <Leaf {...props} />, []);

  useEffect(() => {
    const setCursorAtEnd = editor => {
      const lastNode = value[value.length - 1];
      const lastNodeLength = Node.string(lastNode).length;

      const endPosition = {
        path: [value.length - 1, 0],
        offset: lastNodeLength,
      };

      Transforms.select(editor, {
        anchor: endPosition,
        focus: endPosition,
      });
    };
    if (
      firstRender &&
      editor &&
      ReactEditor.isFocused(editor) &&
      value &&
      value.length > 0
    ) {
      setCursorAtEnd(editor);
      setFirstRender(false);
    }
  }, [firstRender, editor, value]);

  useEffect(() => {
    const handleClick = e => {
      if (
        editorContainerRef.current &&
        e.target.contains(editorContainerRef.current)
      ) {
        const clickedPosition = getClickedRow(e);
        let currentRowCount = editor.children.length;
        const rowsToAdd = clickedPosition.row;

        if (rowsToAdd > 0) {
          for (let i = 0; i < rowsToAdd; i++) {
            const newLineNode = {
              type: 'paragraph',
              children: [{ text: '' }],
            };
            Transforms.insertNodes(editor, newLineNode, {
              at: [currentRowCount],
              select: true,
            });
            currentRowCount++;
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [editor]);

  return (
    <Slate editor={editor} value={value} onChange={onChange}>
      <Toolbar editor={editor} />
      <div ref={editorContainerRef}>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder={__i18n('请填写内容')}
          spellCheck
          autoFocus
        />
      </div>
    </Slate>
  );
};

CustomEditor.propTypes = {
  defaultValue: PropTypes.array,
  onLoad: PropTypes.func.isRequired,
};

export default CustomEditor;
