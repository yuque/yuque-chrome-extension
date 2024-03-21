import { getMsgId } from '@/isomorphic/util';
import type { IRequestOptions, IRequestConfig } from '@/background/core/httpClient';
import ExtensionMessage from '@/isomorphic/extensionMessage/extensionMessage';
import Env from '@/isomorphic/env';
import HttpClient from '@/background/core/httpClient';
import { ExtensionMessageListener } from '@/isomorphic/extensionMessage/interface';

// http 请求单独走一个通道
class HttpProxy {
  private callServiceMethodCallbackFn: { [id: string]: (...rest: any[]) => void } = {};
  private httpClient = Env.isExtensionPage ? new HttpClient() : null;
  constructor() {
    this.init();
  }

  generateCallbackFnId(serviceName: string, methodName: string) {
    const id = getMsgId({ type: `${serviceName}.${methodName}` });
    const callbackFnId = `__funcCallback_${id}`;
    return callbackFnId;
  }

  sendMethodCallToBackground<T>(
    methodParams?: { [key: string]: any },
    callback?: (response: any) => void,
    type?: 'abort' | 'request',
    id?: string,
  ) {
    if (Env.isExtensionPage) {
      if (methodParams?.options?.isFileUpload) {
        this.httpClient?.uploadFile(methodParams.url, methodParams.config).then(res => callback?.(res));
        return;
      }
      this.httpClient
        ?.handleRequest(methodParams?.url, methodParams?.config, {
          ...methodParams?.options,
          streamCallback: callback,
        })
        .then(res => callback?.(res));
      return;
    }
    const callbackFnId = id ? id : this.generateCallbackFnId('', '');
    if (type !== 'abort') {
      this.callServiceMethodCallbackFn[callbackFnId] = (response: any) => {
        callback?.(response);
      };
    }
    ExtensionMessage.sendToBackground(
      ExtensionMessageListener.callRequestService,
      {
        type: type || 'request',
        methodParams: methodParams || {},
        callbackFnId,
      },
      id,
    );
  }

  private init() {
    ExtensionMessage.addListener(
      ExtensionMessageListener.callRequestServiceCallback,
      (params: { funcId: string; response: { [key: string]: any } }) => {
        if (params.funcId) {
          const funcIds = Object.keys(this.callServiceMethodCallbackFn);
          if (funcIds.includes(params.funcId)) {
            this.callServiceMethodCallbackFn[params.funcId](params.response);
          }
        }
      },
    );
  }
}

export const httpProxy = new HttpProxy();

export class Subject<T> {
  observers: Array<(data: T) => void> = [];

  subscribe(fn: (data: T) => void): () => void {
    this.observers.push(fn);

    // 提供取消订阅的函数
    return () => {
      const index = this.observers.indexOf(fn);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  next(data: T): void {
    // 当调用 next 方法时，通知所有订阅者
    for (const observer of this.observers) {
      observer(data);
    }
  }
}

export type IStreamAsyncIteratorSubject = {
  done: boolean;
  data?: any;
  error?: any;
};

export async function* streamAsyncIterator(
  subject: Subject<IStreamAsyncIteratorSubject>,
): AsyncGenerator<any, void, any> {
  let nextResolve: (value: any) => void;
  let end;
  let error;
  let reject: (value: any) => void;

  subject.subscribe(val => {
    end = val.done;
    error = val.error;
    // 兼容一下之前写作助手拿到异常的逻辑
    if (error) {
      const e = new Error() as any;
      e.code = error;
      e.message = error;
      e.data = val;
      reject(e);
    } else {
      nextResolve(val);
    }
  });

  while (!end) {
    // eslint-disable-next-line
    yield new Promise((resolve, r) => {
      nextResolve = resolve;
      reject = r;
    });
  }
}

export function streamRequestDecorator(url: string, config: IRequestConfig, options: IRequestOptions) {
  const subject = new Subject<IStreamAsyncIteratorSubject>();
  const requestParams = { url, config, options };
  const requestId = httpProxy.generateCallbackFnId('RequestApiService', 'request');
  httpProxy.sendMethodCallToBackground<any>(
    {
      url,
      config,
      options: {
        ...options,
        requestId,
      },
    },
    res => {
      // 存在错误
      if (res.error) {
        subject.next({
          error: res?.error || res,
          done: true,
          data: res.data,
        });
        return;
      }
      if (!options.stream) {
        subject.next({
          data: res.data.data,
          done: true,
        });
        return;
      }
      subject.next({
        data: res.data,
        done: res.done,
      });
    },
    'request',
    requestId,
  );

  const abort = () => {
    httpProxy.sendMethodCallToBackground(
      requestParams,
      () => {
        //
      },
      'abort',
      requestId,
    );
  };

  return {
    abort,
    res: streamAsyncIterator(subject),
  };
}
