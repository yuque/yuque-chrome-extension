import React, { useEffect, useRef, useMemo } from 'react';
import classnames from 'classnames';
import throttle from 'lodash/throttle';
import { CheckOutlined } from '@ant-design/icons';
import { __i18n } from '@/isomorphic/i18n';
import { ITag } from '@/core/webProxy/tag';
import styles from './TagInput.module.less';

const KEY_CODE_MAP = {
  enter: 13,
  up: 38,
  down: 40,
};

const MAX_LENGTH = 100;

export interface TagInputProps {
  onConfirm?: (item: string) => Promise<void>;
  onChange: (value: string) => void;
  value: string;
  autoFocus: boolean;
  onFocus?: VoidFunction;
  visible: boolean;
  onBlur?: VoidFunction;
  confirmOnBlur?: boolean;
  onPressKeyDown?: VoidFunction;
  tags: ITag[];
}

function TagInput(props: TagInputProps) {
  const {
    onConfirm,
    onChange,
    value,
    autoFocus,
    onFocus,
    visible,
  } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocus && visible) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    }
  }, [visible, inputRef]);

  const confirmTag = useMemo(
    () =>
      throttle(async (tagName: string): Promise<void> => {
        if (!onConfirm) {
          return;
        }
        await onConfirm(tagName);
      }, 300),
    [onConfirm],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const keyCode = e.keyCode || e.which;
    if (keyCode === KEY_CODE_MAP.enter) {
      e.preventDefault();
      e.stopPropagation();
      confirmTag((e.target as any).value);
    }
  };

  return (
    <div className={styles.wrapper}>
      <input
        ref={inputRef}
        placeholder={__i18n('输入标签名...')}
        className={styles.input}
        type="text"
        value={value}
        onKeyDown={onKeyDown}
        onFocus={onFocus || undefined}
        onInput={(e: any) => {
          onChange(e.target.value);
        }}
        maxLength={MAX_LENGTH}
      />
      {!!onConfirm && !!value && (
        <span
          onMouseDown={e => {
            e.preventDefault();
          }}
          className={classnames(styles.checkIcon)}
          onClick={() => {
            confirmTag(value);
          }}
        >
          <CheckOutlined width={16} />
        </span>
      )}
    </div>
  );
}

export default TagInput;
