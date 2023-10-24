import React, { useState, useRef } from 'react';
import { Input, InputRef } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { __i18n } from '@/isomorphic/i18n';
import Shortcut, { PlatformEnum } from '@/isomorphic/shortcut';
import styles from './index.module.less';

interface IShortcutItemProps {
  defaultShortcut?: string;
  onRemoveShortcut?: (shortcut: string) => void;
  onChangeShortCut?: (shortcut: string) => void;
}

const shortCutString = __i18n('设置快捷键');

const shortcutHandler = new Shortcut({ platform: PlatformEnum.macOS });

function ShortcutItem(props: IShortcutItemProps) {
  const {
    defaultShortcut = '',
    onRemoveShortcut,
    onChangeShortCut,
  } = props || {};

  const getShowString = (key: string) =>
    !key ? shortCutString : shortcutHandler.shortcutToShowString(key);

  const [editing, setEditing] = useState(false);
  const [showString, setShowString] = useState(getShowString(defaultShortcut));
  const [currentKeyBoardInput, setCurrentKeyBoardInput] = useState('');
  const inputRef = useRef<InputRef>(null);
  const [showError, setShowError] = useState(false);

  const handleKeyboardInput = async (e: React.KeyboardEvent) => {
    const { keyboardString, shortcut } =
      shortcutHandler.getShortcutByKeyboard(e);
    console.log(keyboardString, shortcut);
    if (!keyboardString) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setCurrentKeyBoardInput(keyboardString);
    if (shortcut) {
      onChangeShortCut?.(keyboardString);
      inputRef.current?.blur();
      setEditing(false);
      setCurrentKeyBoardInput('');
      setShowString(keyboardString);
    }
  };

  const removeShortcut = async (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    onRemoveShortcut?.('');
    setShowString(shortCutString);
  };

  let showText = showString;
  if (editing) {
    // 编辑中的状态，如果有键盘有输入，显示键盘内容，否则给提示
    showText = currentKeyBoardInput || __i18n('请输入快捷键');
  }

  return (
    <div
      className={styles.globalShortcut}
      onClick={() => {
        if (!editing) {
          setEditing(true);
          inputRef.current?.focus();
        }
      }}
      onBlur={() => {
        /* istanbul ignore next */
        setTimeout(() => {
          setEditing(false);
          setCurrentKeyBoardInput('');
        }, 200);
      }}
    >
      <div className={styles.inputWrapper}>
        <Input
          // 保证不会触发中文输入法
          readOnly
          ref={inputRef}
          onKeyDown={handleKeyboardInput}
          className={styles.input}
        />
        <p className={styles.inputTip}>{showText}</p>
        {showString && (
          <div onClick={removeShortcut} className={styles.tooltip}>
            <CloseOutlined />
          </div>
        )}
      </div>
      {showError && (
        <div className={styles.error}>
          {__i18n('需以 Ctrl 键、Alt 键、Option 键或 ⌘ 键开头')}
        </div>
      )}
    </div>
  );
}

export default ShortcutItem;
