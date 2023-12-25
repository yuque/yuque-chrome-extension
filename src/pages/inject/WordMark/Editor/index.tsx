import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  EDITOR_IFRAME_CONTAINER_ID,
  EditorMessageType,
  EditorMessageKey,
} from '@/isomorphic/event/editor';

export interface IEditorRef {
  /**
   * 追加html到文档
   * @param html html内容
   * @param breakLine 是否前置一个换行符
   */
  appendContent: (html: string, breakLine?: boolean) => Promise<void>;
  /**
   * 设置文档内容，将清空旧的内容
   * @param html html内容
   */
  setContent: (
    content: string,
    type?: 'text/lake' | 'text/html',
  ) => Promise<void>;
  /**
   * 获取文档内容
   * @param type 内容的格式
   * @return 文档内容
   */
  getContent: (type: 'lake' | 'text/html') => Promise<string>;
  /**
   * 判断当前文档是否是空文档
   * @return true表示当前是空文档
   */
  isEmpty: () => Promise<boolean>;

  /**
   * 获取额外信息
   * @return
   */
  getSummaryContent: () => Promise<string>;

  /**
   * 统计字数
   * @return
   */
  wordCount: () => Promise<number>;

  /**
   * 聚焦到文档开头
   * @param {number} offset 偏移多少个段落，可以将选区落到开头的第offset个段落上, 默认是0
   * @return
   */
  focusToStart: (offset?: number) => Promise<void>;

  /**
   * 插入换行符
   * @return
   */
  insertBreakLine: () => Promise<void>;
}

const getRequestID = (() => {
  let id = 0;
  return () => {
    id++;
    return id;
  };
})();

export default forwardRef<IEditorRef, {}>((props, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const sendMessageRef = useRef<(data: any) => Promise<any>>();
  const [needLoadEditor, setNeedLoadEditor] = useState(true);

  useEffect(() => {
    const resolveCache: Map<number, (data: any) => void> = new Map();
    const messageFunc = (event: MessageEvent<any>) => {
      if (event.data.key !== EditorMessageKey) return;
      if (resolveCache.has(event.data.requestId)) {
        resolveCache.get(event.data.requestId)?.(event.data);
        resolveCache.delete(event.data.requestId);
      }
      if (event.data.type === 'editor-ready') {
        sendMessageRef.current = requestData =>
          new Promise(resolve => {
            const requestId = getRequestID();
            resolveCache.set(requestId, data => {
              resolve(data);
            });
            iframeRef.current?.contentWindow?.postMessage(
              {
                key: EditorMessageKey,
                requestId,
                ...requestData,
              },
              '*',
            );
          });
      }
    };
    window.addEventListener('message', messageFunc);
    return () => {
      window.removeEventListener('message', messageFunc);
    };
  }, []);

  const sendMessage = useCallback((action: EditorMessageType, data?: any) => {
    return (sendMessageRef.current as (data: any) => Promise<any>)({
      action,
      data,
    });
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      appendContent: (html: string, breakLine = false) => {
        return sendMessage(EditorMessageType.appendContent, {
          html,
          breakLine,
        });
      },
      setContent: (
        content: string,
        type: 'text/lake' | 'text/html' = 'text/html',
      ) => {
        return sendMessage(EditorMessageType.setContent, {
          content,
          type,
        });
      },
      isEmpty: () => {
        return sendMessage(EditorMessageType.isEmpty).then(data => {
          return data.data;
        });
      },
      getContent: async (type: 'lake' | 'text/html' | 'description') => {
        return sendMessage(EditorMessageType.getContent, {
          type,
        }).then(data => {
          return data.data;
        });
      },
      getSummaryContent: async () => {
        return sendMessage(EditorMessageType.getSummaryContent).then(data => {
          return data.data;
        });
      },
      wordCount: async () => {
        return sendMessage(EditorMessageType.wordCount).then(data => {
          return data.data;
        });
      },
      focusToStart: async (offset = 0) => {
        return sendMessage(EditorMessageType.focusToStart, {
          offset,
        }).then(data => {
          return data.data;
        });
      },
      insertBreakLine: async () => {
        return sendMessage(EditorMessageType.insertBreakLine);
      },
    }),
    [sendMessage],
  );

  useEffect(() => {
    // 当页面可见性发生改变时，如果发现用户未使用过插件，释放掉 editor iframe
    const onVisibilitychange = () => {
      if (document.hidden) {
        setNeedLoadEditor(false);
      } else {
        setNeedLoadEditor(true);
      }
    };
    document.addEventListener('visibilitychange', onVisibilitychange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilitychange);
    };
  }, []);

  if (!needLoadEditor) {
    return null;
  }

  return (
    <iframe
      src={chrome.runtime.getURL('editor.html')}
      ref={iframeRef}
      id={EDITOR_IFRAME_CONTAINER_ID}
      style={{ display: 'none' }}
    />
  );
});
