import React, { useState } from 'react';
import Modal from 'antd/lib/modal';
import { Button, message } from 'antd/lib';

import './modal-ocr.less';
import LarkIcon from '../LarkIcon';

export interface IOCRModalProps {
  src: string;
  ocr: any[];
  Icon: any;
  copyText?: (text: string) => boolean;
  onInsertText?: (text: string) => void;
}

const punctuationMarks: Record<string, string> = {
  '!': '！',
  '?': '？',
  ',': '，',
  '.': '。',
  ':': '：',
  ';': '；',
  '(': '（',
  ')': '）',
  '[': '【',
  ']': '】',
  '<': '《',
  '>': '》',
};

const CHINESE_CHAR_REG = /[\u3400-\u9FBF]/;
export function isChineseChar(ch: string) {
  return CHINESE_CHAR_REG.test(ch);
}

export function replaceTextPunc(text: string) {
  return text.replace(/[\!\?\,\.\:\;\(\)\[\]\<\>]/g, (punc, index) => {
    const prevCh = text[index - 1];
    if (prevCh && isChineseChar(prevCh)) {
      return punctuationMarks[punc] || punc;
    }
    return punc;
  });
}

export default function OCRModal(props: IOCRModalProps) {
  const [value, setValue] = useState(
    replaceTextPunc(
      props.ocr
        .sort((v1, v2) => {
          if (Math.abs(v1.y - v2.y) <= 10) {
            return v1.x - v2.x;
          }
          return v1.y - v2.y;
        })
        .reduce(
          (ret, cur) => {
            if (ret.prev && Math.abs(ret.prev.y - cur.y) > 10) {
              ret.text += '\n';
            } else if (ret.prev) {
              ret.text += ' ';
            }
            ret.text += cur.text.toLocaleLowerCase();
            ret.prev = cur;
            return ret;
          },
          { prev: null, text: '' } as {
            prev: any | null;
            text: string;
          },
        )
        .text.replace(/\n{2}/g, '\n'),
    ),
  );

  return (
    <div className="ne-ocr-split">
      <div className="ne-ocr-text-container">
        <textarea
          value={value}
          onChange={e => {
            setValue(e.target.value);
          }}
        />
        <div className="ne-ocr-button-group">
          <div className="ne-ocr-button-wrap">
            <Button
              type={props.onInsertText ? 'default' : 'primary'}
              className="ne-ocr-copy"
              onClick={() => {
                if (props.copyText?.(value)) {
                  message.success('复制成功');
                } else {
                  message.error('复制失败');
                }
              }}
            >
              <LarkIcon name="action-copy" size={16} />
              复制全文
            </Button>
            {props.onInsertText && (
              <Button
                type="primary"
                onClick={() => {
                  props.onInsertText?.(value);
                }}
                className="ne-ocr-insert"
              >
                插入文中
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function showEditorModal(cardUI: any) {
  cardUI.hideAllToolbar?.();
  let hasInsert = false;

  const modal = Modal.info({
    className: 'ne-ocr-modal',
    width: '90%',
    closable: true,
    icon: null,
    title: '提取图中的文本',
    focusTriggerAfterClose: false,
    afterClose: () => {
      if (!hasInsert) {
        cardUI.editor.execCommand('focus');
      }
    },
    content: (
      <OCRModal
        src={cardUI.getDisplayUrl() || cardUI.cardData.getSrc()}
        ocr={cardUI.cardData.getOcrLocations() || []}
        copyText={cardUI.copyText}
        Icon={cardUI.Icon}
        onInsertText={text => {
          hasInsert = true;
          cardUI.insertTextAfterImage(text);
          modal.destroy();
        }}
      />
    ),
  });
}
