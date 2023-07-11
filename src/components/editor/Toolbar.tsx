import React, { useRef, useEffect, useState } from 'react';
import { useFocused } from 'slate-react';
import { Editor, Range, Transforms, Text } from 'slate';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
} from '@ant-design/icons';
import { Button, Tooltip, Popover } from 'antd';
import styles from './Toolbar.module.less';

const Toolbar = ({ editor }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateToolbarPosition = () => {
      const el = ref.current;
      const { selection } = editor;
      if (!el || !selection || !focused || Range.isCollapsed(selection)) {
        setVisible(false);
        return;
      }

      const domSelection = window.getSelection();
      const domRange = domSelection.getRangeAt(0);
      const rect = domRange.getBoundingClientRect();
      const lineHeight =
        parseInt(
          getComputedStyle(document.body).getPropertyValue('line-height'),
          10,
        ) || 20;

      el.style.position = 'absolute';
      el.style.top = `${
        rect.top + window.pageYOffset - el.offsetHeight - lineHeight / 2
      }px`;
      el.style.left = `${
        rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
      }px`;

      setVisible(true);
    };

    document.addEventListener('selectionchange', updateToolbarPosition);

    return () => {
      document.removeEventListener('selectionchange', updateToolbarPosition);
    };
  }, [editor, focused]);

  const content = (
    <div>
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
        format="underline"
        IconComponent={UnderlineOutlined}
      />
    </div>
  );

  return (
    <div ref={ref} className={visible ? styles.toolbar : ''}>
      <Popover content={content} title={null} trigger="click" visible={visible}>
        <span />
      </Popover>
    </div>
  );
};

const FormatButton = ({ editor, format, IconComponent }) => {
  return (
    <Tooltip title={format} mouseEnterDelay={0} mouseLeaveDelay={0}>
      <Button
        type="text"
        icon={<IconComponent />}
        onClick={() => toggleMark(editor, format)}
        style={{ color: isMarkActive(editor, format) ? 'black' : '#ccc' }}
      />
    </Tooltip>
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
