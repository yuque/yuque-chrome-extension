import React, { TextareaHTMLAttributes, useRef, useState } from 'react';
import classnames from 'classnames';
import { Input, InputRef } from 'antd';
import { __i18n } from '@/isomorphic/i18n';
import Typography from '@/components/Typography';
import styles from './index.module.less';

export interface ISingleLineInputRef {
  textArea: InputRef | null;

  focus(): void;

  clear(): void;

  setValue(value: string): void;
}

interface Props extends TextareaHTMLAttributes<any> {
  onEnter?: (input: string) => void;
  extra?: React.ReactNode;
}

const SingleLineInputImpl = (props: Props, ref: any) => {
  const { placeholder, onEnter, disabled } = props;
  const [input, setInput] = useState('');

  const inputRef = useRef<InputRef>(null);

  React.useImperativeHandle(
    ref,
    (): ISingleLineInputRef => ({
      get textArea() {
        return inputRef.current;
      },
      focus() {
        inputRef.current?.focus();
      },
      clear() {
        setInput('');
      },
      setValue(value) {
        setInput(value);
      },
    }),
    [inputRef.current],
  );

  return (
    <div
      className={classnames(styles.wrapper, props.className)}
      style={props.style}
    >
      <Input.TextArea
        value={input}
        placeholder={placeholder || __i18n('来问我鸭!')}
        autoSize={{ minRows: 1, maxRows: 4 }}
        ref={inputRef}
        className={styles.input}
        bordered={false}
        autoFocus
        disabled={disabled}
        onPressEnter={e => {
          e.preventDefault();
          if (e.ctrlKey) {
            return setInput(`${input}\n`);
          }

          return onEnter?.((e.target as any).value);
        }}
        onChange={e => {
          setInput(e.target.value);
        }}
      />
      <div className={styles.footer}>
        {props.extra}
        <span className={styles.placeholder} />
        <Typography color="yuque-grey-6" mr={8}>
          {__i18n('control+↵ 换行')}
        </Typography>
      </div>
    </div>
  );
};

export const SingleLineInput = React.forwardRef(SingleLineInputImpl);
