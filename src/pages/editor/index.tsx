import React, { useRef, useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { urlOrFileUpload } from '@/core/html-parser';
import LakeEditor, { IEditorRef } from '@/components/lake-editor/editor';
import { EditorMessageType, EditorMessageKey } from '@/isomorphic/editor';
import styles from './index.module.less';

function Editor() {
  const editorRef = useRef<IEditorRef>(null);

  const onUploadImage = useCallback(async (params: { data: string }) => {
    return urlOrFileUpload(params.data);
  }, []);

  useEffect(() => {
    const listener = async (e: MessageEvent<any>) => {
      if (e.data?.key !== EditorMessageKey) {
        return;
      }
      const { action, data, requestId } = e.data || {};
      const sendMessage = (params?: any) => {
        window.parent.postMessage(
          {
            key: EditorMessageKey,
            requestId,
            action,
            data: params,
          },
          '*',
        );
      };
      switch (action) {
        case EditorMessageType.appendContent: {
          editorRef.current.appendContent(data.html, data.breakLine);
          sendMessage();
          break;
        }
        case EditorMessageType.setContent: {
          editorRef.current.setContent(data.content, data.type);
          sendMessage();
          break;
        }
        case EditorMessageType.getContent: {
          const content = await editorRef.current.getContent(data.type);
          sendMessage(content);
          break;
        }
        case EditorMessageType.isEmpty: {
          const isEmpty = editorRef.current.isEmpty();
          sendMessage(isEmpty);
          break;
        }
        case EditorMessageType.getSummaryContent: {
          const content = editorRef.current.getSummaryContent();
          sendMessage(content);
          break;
        }
        case EditorMessageType.wordCount: {
          const wordCount = editorRef.current.wordCount();
          sendMessage(wordCount);
          break;
        }
        case EditorMessageType.focusToStart: {
          editorRef.current.focusToStart(data.offset);
          sendMessage();
          break;
        }
        case EditorMessageType.insertBreakLine: {
          editorRef.current.insertBreakLine();
          sendMessage();
          break;
        }
        default:
          break;
      }
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, []);

  useEffect(() => {
    window.parent.postMessage(
      {
        key: 'editor',
        type: 'editor-ready',
      },
      '*',
    );
  }, []);

  return (
    <div className={styles['lake-editor']}>
      <LakeEditor
        ref={editorRef}
        value=""
        onLoad={() => {}}
        onSave={() => {
          window.parent.postMessage(
            {
              key: EditorMessageKey,
              action: 'yq-save',
            },
            '*',
          );
        }}
        uploadImage={onUploadImage}
      />
    </div>
  );
}

const root = createRoot(document.getElementById('ReactApp'));
root.render(<Editor />);
