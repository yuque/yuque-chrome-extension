import React, {
  HTMLAttributes,
  PropsWithChildren,
  Ref,
  useEffect,
  useState,
} from 'react';
import { Editor as SlateEditor } from 'slate';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import CodeIcon from '@mui/icons-material/Code';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import styles from './Toolbar.module.less';
import { isMarkActive, toggleMark, isBlockActive, toggleBlock } from './util';

type BaseProps = {
  className?: string;
};

type OrNull<T> = T | null;

type ToolbarProps = {
  editor: SlateEditor;
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
        <MarkButton
          editor={editor}
          format="bold"
          IconComponent={FormatBoldIcon}
        />
        <MarkButton
          editor={editor}
          format="italic"
          IconComponent={FormatItalicIcon}
        />
        <MarkButton
          editor={editor}
          format="underline"
          IconComponent={FormatUnderlinedIcon}
        />
        <MarkButton editor={editor} format="code" IconComponent={CodeIcon} />
        <BlockButton
          editor={editor}
          format="block-quote"
          IconComponent={FormatQuoteIcon}
        />
        <BlockButton
          editor={editor}
          format="numbered-list"
          IconComponent={FormatListNumberedIcon}
        />
        <BlockButton
          editor={editor}
          format="bulleted-list"
          IconComponent={FormatListBulletedIcon}
        />
      </Menu>
    );
  },
);

const MarkButton = ({ editor, format, IconComponent }) => {
  const [ isActive, setIsActive ] = useState(() => isMarkActive(editor, format));

  useEffect(() => {
    const updateIsActive = () => {
      setIsActive(isMarkActive(editor, format));
    };

    document.addEventListener('selectionchange', updateIsActive);
    return () => {
      document.removeEventListener('selectionchange', updateIsActive);
    };
  }, [ editor, format ]);

  const handleMouseDown = e => {
    e.preventDefault();
    toggleMark(editor, format);
  };

  return (
    <Button
      onMouseDown={handleMouseDown}
      active={isActive}
      reversed={false}
      className="mark-button"
    >
      <IconComponent />
    </Button>
  );
};

const BlockButton = ({ editor, format, IconComponent }) => {
  const [ isActive, setIsActive ] = useState(() => isBlockActive(editor, format));

  useEffect(() => {
    const updateIsActive = () => {
      setIsActive(isBlockActive(editor, format));
    };

    document.addEventListener('selectionchange', updateIsActive);
    return () => {
      document.removeEventListener('selectionchange', updateIsActive);
    };
  }, [ editor, format ]);

  const handleMouseDown = e => {
    e.preventDefault();
    toggleBlock(editor, format);
  };

  return (
    <Button
      onMouseDown={handleMouseDown}
      active={isActive}
      reversed={false}
      className="block-button"
    >
      <IconComponent />
    </Button>
  );
};

export default Toolbar;
