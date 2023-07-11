import React, { HTMLAttributes, PropsWithChildren, Ref, useRef } from 'react';
import { Editor, Transforms, Text } from 'slate';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
} from '@ant-design/icons';
import styles from './Toolbar.module.less';

type BaseProps = {
  className?: string;
};

type OrNull<T> = T | null;

type ToolbarProps = {
  editor: Editor;
} & BaseProps;

type ButtonProps = {
  active: boolean;
  reversed: boolean;
} & BaseProps &
  HTMLAttributes<HTMLSpanElement>;

const Menu = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: Ref<OrNull<HTMLDivElement>>,
  ) => (
    <div
      {...props}
      data-test-id="menu"
      ref={ref}
      className={`${styles.menu} ${className}`}
    />
  ),
);

const Button = React.forwardRef(
  (
    { className, active, reversed, ...props }: PropsWithChildren<ButtonProps>,
    ref: Ref<OrNull<HTMLSpanElement>>,
  ) => (
    <span
      {...props}
      ref={ref}
      className={`${styles.button} ${
        active ? styles.active : styles.inactive
      } ${reversed ? styles.reversed : ''} ${className}`}
    />
  ),
);

export const Toolbar = React.forwardRef(
  (
    { className, editor, ...props }: PropsWithChildren<ToolbarProps>,
    ref: Ref<OrNull<HTMLDivElement>>,
  ) => {
    return (
      <Menu {...props} ref={ref} className={`${styles.toolbar} ${className}`}>
        <FormatButton
          editor={editor}
          format="bold"
          IconComponent={BoldOutlined}
        />
        <FormatButton
          editor={editor}
          format="italic"
          IconComponent={ItalicOutlined}
        />
        <FormatButton
          editor={editor}
          format="underlined"
          IconComponent={UnderlineOutlined}
        />
      </Menu>
    );
  },
);

const FormatButton = ({ editor, format, IconComponent }) => {
  const isActive = isMarkActive(editor, format);

  const handleMouseDown = e => {
    e.preventDefault();
    toggleMark(editor, format);
  };

  return (
    <Button
      onMouseDown={handleMouseDown}
      active={isActive}
      reversed={false}
      className="format-button"
    >
      <IconComponent />
    </Button>
  );
};
const isMarkActive = (editor, format) => {
  const { selection } = editor;
  if (selection) {
    const [match] = Editor.nodes(editor, {
      at: selection,
      match: n => Text.isText(n) && n[format] === true,
    });
    return !!match;
  }
  return false;
};

const toggleMark = (editor, format) => {
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

export default Toolbar;
