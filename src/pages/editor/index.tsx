import React, { useRef, useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { webProxy } from '@/core/webProxy';
import LakeEditor, { IEditorRef } from '@/components/lake-editor/editor';
import { EditorMessageType, EditorMessageKey } from '@/isomorphic/event/editor';

function Editor() {
  const editorRef = useRef<IEditorRef>(null);

  const onUploadImage = useCallback(async (params: { data: string }) => {
    return webProxy.upload.attach(params.data);
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
          editorRef.current?.appendContent(data.html, data.breakLine);
          sendMessage();
          break;
        }
        case EditorMessageType.setContent: {
          editorRef.current?.setContent(data.content, data.type);
          sendMessage();
          break;
        }
        case EditorMessageType.getContent: {
          const content = await editorRef.current?.getContent(data.type);
          sendMessage(content);
          break;
        }
        case EditorMessageType.isEmpty: {
          const isEmpty = editorRef.current?.isEmpty();
          sendMessage(isEmpty);
          break;
        }
        case EditorMessageType.getSummaryContent: {
          const content = editorRef.current?.getSummaryContent();
          sendMessage(content);
          break;
        }
        case EditorMessageType.wordCount: {
          const wordCount = editorRef.current?.wordCount();
          sendMessage(wordCount);
          break;
        }
        case EditorMessageType.focusToStart: {
          editorRef.current?.focusToStart(data.offset);
          sendMessage();
          break;
        }
        case EditorMessageType.insertBreakLine: {
          editorRef.current?.insertBreakLine();
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
    <LakeEditor
      ref={editorRef}
      value=""
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onSave={() => {}}
      uploadImage={onUploadImage as any}
    />
  );
}

const root = createRoot(document.getElementById('ReactApp') as Element);
root.render(<Editor />);
