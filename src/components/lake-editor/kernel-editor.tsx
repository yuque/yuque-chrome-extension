import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

export interface KernelEditorProps {
  value: string;
  onLoad?: () => void;
  resource: {
    docJS: string;
    kernelEditorJS: string;
  };
}

const key = 'kernel-editor';
const getRequestID = (() => {
  let id = 0;
  return () => {
    id++;
    return id;
  };
})();

export interface IKernelEditorRef {
  /**
   * 设置文档内容，将清空旧的内容
   * @param html html内容
   */
  setContent: (type: 'lake' | 'text/html', data: string) => Promise<void>;
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
}



export default forwardRef<IKernelEditorRef, KernelEditorProps>((props, ref) => {
  const { value, onLoad } = props;
  const [ _loading, setLoading ] = useState(true);
  const [ sendMessage, setSendMessage ] = useState<(data: any)=> Promise<any>>(null);
  const contextRef = useRef({
    onLoad: props.onLoad,
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const templateHtml = useMemo(() => {
    /**
    * iframe的内容
    */
    return `
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="UTF-8">
     <title></title>
   </head>
   <body>
     <script src="${props.resource.docJS}"></script>
     <script src="${props.resource.kernelEditorJS}"></script>
   </body>
   </html>
   `;
  }, [props.resource]);

  useEffect(() => {
    const resolveCache: Map<number, ((data: any) => void)> = new Map();

    const messageFunc = (event: MessageEvent<any>) => {
      if (event.data.key !== key) return;
      if (resolveCache.has(event.data.requestId)) {
        resolveCache.get(event.data.requestId)(event.data);
        resolveCache.delete(event.data.requestId);
      }

      if (event.data.type === 'editor-ready') {
        setSendMessage(() => requestData => {
          return new Promise(resolve => {
            const requestId = getRequestID();
            resolveCache.set(requestId, data => {
              resolve(data);
            });
            iframeRef.current?.contentWindow?.postMessage({
              key,
              requestId,
              ...requestData,
            }, '*');
          });
        });
      }
    };
    window.addEventListener('message', messageFunc);
    return () => {
      window.removeEventListener('message', messageFunc);
    };
  }, []);

  // 设置编辑器内容
  useEffect(() => {
    if (!sendMessage) return;
    sendMessage({
      type: 'set-content',
      data: {
        type: 'text/html',
        content: value,
      },
    }).then(() => {
      setLoading(false);
      contextRef.current?.onLoad?.();
    });
  }, [ sendMessage, value ]);

  // 更新回调
  useEffect(() => {
    contextRef.current.onLoad = onLoad;
  }, [ onLoad ]);

  // 导出ref
  useImperativeHandle(ref, () => ({
    setContent: (type: 'lake' | 'text/html', content: string) => {
      if (!sendMessage) return Promise.resolve();
      return sendMessage({
        type: 'set-content',
        data: {
          type,
          content,
        },
      });
    },
    isEmpty: () => {
      if (!sendMessage) return Promise.resolve(true);
      return sendMessage({
        type: 'is-empty',
      }).then(data => {
        return data.data;
      });
    },
    getContent: async (type: 'lake' | 'text/html' | 'description') => {
      if (!sendMessage) return Promise.resolve('');
      return sendMessage({
        type: 'get-content',
        data: {
          type: type === 'lake' ? 'text/lake' : type,
        },
      }).then(data => {
        return data.data;
      });
    },
    getSummaryContent: () => {
      if (!sendMessage) return Promise.resolve('');
      return sendMessage({
        type: 'get-summary-content',
      }).then(data => {
        return data.data;
      });
    },
    wordCount: () => {
      if (!sendMessage) return Promise.resolve(0);
      return sendMessage({
        type: 'word-count',
      }).then(data => {
        return data.data;
      });
    },
  }),
  [ sendMessage ],
  );

  // 渲染iframe
  // 通过iframe加载lake编辑器防止样式污染
  return (
    <iframe
      ref={iframeRef}
      height="100%"
      id={key}
      srcDoc={templateHtml}
      allow="*"
      style={{
        position: 'absolute',
        background: 'transparent',
        border: 'none',
        height: '100%',
        width: '100%',
      }}
    />
  );
});
