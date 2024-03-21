import 'whatwg-fetch';
import {
  CSRF_HEADER_NAME,
  EXTENSION_ID,
  REQUEST_HEADER_VERSION,
  YUQUE_CSRF_COOKIE_NAME,
  YUQUE_DOMAIN,
  pkg,
} from '@/config';
import { getMsgId, transformUrlToFile } from '@/isomorphic/util';
import { PageEventTypes } from '@/isomorphic/event/pageEvent';
import ExtensionMessage from '@/isomorphic/extensionMessage/extensionMessage';
import { ExtensionMessageListener } from '@/isomorphic/extensionMessage/interface';
import Env from '@/isomorphic/env';
import chromeExtension from './chromeExtension';
import { getCurrentAccount } from './util';

export type IRequestMethod =
  | 'GET'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'PURGE'
  | 'LINK'
  | 'UNLINK';

export interface IHttpResponse {
  success: boolean;
  status: number;
  data: any;
  error?: any;
}

export interface IRequestConfig {
  baseURL?: string;
  method: IRequestMethod;
  data?: any;
  headers?: HeadersInit;
  signal?: AbortSignal | null;
}

export interface IRequestOptions {
  isFileUpload?: boolean;
  stream?: boolean;
  streamCallback?: (params: { done: boolean; data: any }) => void;
  requestId?: string;
}

export enum HttpClientError {
  // 用户主动断链接
  AbortError = 'AbortError',
}

export default class HttpClient {
  // 请求 map
  private requestMap: { [key: string]: { abort: () => void } } = {};
  private decoder = new TextDecoder();

  constructor() {
    // 只在后台监听，其余系统页都不监听
    if (!Env.isBackground) {
      return;
    }
    // 监听关闭的请求
    ExtensionMessage.addListener(ExtensionMessageListener.callRequestService, async (data, requestId, { tab }) => {
      const { type, methodParams = {}, callbackFnId } = data;

      const callback = (response: any) => {
        if (tab?.id && callbackFnId) {
          ExtensionMessage.sendToContent(
            tab.id,
            ExtensionMessageListener.callRequestServiceCallback,
            {
              funcId: callbackFnId,
              response,
            },
            callbackFnId,
          );
        }
      };

      if (type === 'request') {
        if (methodParams.options?.isFileUpload) {
          try {
            const res = await this.uploadFile(methodParams.url, methodParams.config);
            callback(res);
          } catch (e: any) {
            callback({ error: e?.message });
          }
          return;
        }
        const res = await this.handleRequest(methodParams.url, methodParams.config, {
          ...methodParams.options,
          streamCallback: callback,
        });
        callback(res);
        return;
      }

      if (type === 'abort') {
        const request = this.requestMap[requestId];
        if (!request) {
          console.debug(`request ${requestId} not found`);
          return;
        }
        request.abort();
      }
    });
  }

  private async prepareHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      [REQUEST_HEADER_VERSION]: pkg.version,
      [EXTENSION_ID]: chrome.runtime.id,
    };
    const csrfToken = await this.getCsrfToken(YUQUE_DOMAIN, YUQUE_CSRF_COOKIE_NAME);
    if (csrfToken) {
      headers[CSRF_HEADER_NAME] = csrfToken;
    } else {
      throw new Error('csrf token not found');
    }
    return headers;
  }

  private generateQuery(params: { [key: string]: any }) {
    return `?${new URLSearchParams(params).toString()}`;
  }

  private async handlePrepareRequestParams(url: string, _config: IRequestConfig, _option?: IRequestOptions) {
    const headers = await this.prepareHeaders();
    const config: RequestInit = {
      ..._config,
      headers: {
        ...headers,
        ..._config.headers,
      },
    };
    let queryString = '';
    if (_option?.isFileUpload) {
      config.body = _config.data;
    } else if (_config.method === 'POST' || _config.method === 'PUT') {
      config.headers = {
        'Content-Type': 'application/json; charset=UTF-8',
        Accept: 'application/json',
        ...config.headers,
      };
      config.body = JSON.stringify(_config.data);
    } else if (_config.method === 'GET' && _config.data) {
      const params = _config.data;
      const paramsArray: string[] = [];
      Object.keys(params).forEach(key => paramsArray.push(`${key}=${params[key]}`));
      if (paramsArray.length > 0) {
        queryString = `?${paramsArray.join('&')}`;
      }
    }
    const baseUrl = _config.baseURL || YUQUE_DOMAIN;
    return {
      url: `${baseUrl}${url}${queryString}`,
      config,
    };
  }

  private async getCsrfToken(domain: string, cookieName: string): Promise<string> {
    return new Promise(resolve => {
      chrome.cookies.get({ url: domain, name: cookieName }, cookie => {
        if (cookie) {
          resolve(cookie.value);
        } else {
          const randomToken = Math.random().toString(36).substring(2);
          chrome.cookies.set({ url: domain, name: cookieName, value: randomToken }, cookie => {
            resolve(cookie?.value || '');
          });
        }
      });
    });
  }

  async handleRequest(
    url: string,
    config: IRequestConfig,
    options?: IRequestOptions,
  ): Promise<{ success?: boolean; data?: any; status?: number; error?: HttpClientError }> {
    try {
      const params = await this.handlePrepareRequestParams(url, config, options);
      const controller = new AbortController();
      if (options?.requestId) {
        this.requestMap[options.requestId] = {
          abort: () => {
            controller.abort();
          },
        };
      }

      const response = await fetch(params.url, {
        ...params.config,
        signal: controller.signal,
      });

      if (!(response.status >= 200 && response.status < 300)) {
        const responseJson = await response.json();
        throw responseJson;
      }

      /**
       * 流式处理
       */
      if (options?.stream) {
        await new Promise((resolve, reject) => {
          const reader = response.body?.getReader();
          const readableStreamConfig = {
            start: (controller: ReadableStreamDefaultController) => {
              const read = () => {
                reader
                  ?.read()
                  .then(({ done, value }) => {
                    if (done) {
                      controller.close();
                      options?.streamCallback?.({ done: true, data: {} });
                      if (options.requestId && this.requestMap[options.requestId]) {
                        this.requestMap[options.requestId].abort();
                      }
                      resolve(true);
                      return;
                    }
                    const text = this.decoder.decode(value);
                    try {
                      const data = JSON.parse(text);
                      controller.enqueue(data);
                      options?.streamCallback?.({ done: false, data });
                      read();
                    } catch (error) {
                      //
                    }
                  })
                  .catch(e => reject(e));
              };
              read();
            },
          };
          new ReadableStream(readableStreamConfig).getReader().read();
        });
        return { success: true, status: response.status, data: {} };
      }
      const responseJson = await response.json();
      return { success: true, status: response.status, data: responseJson };
    } catch (e: any) {
      // 登录过期
      if (e.status === 401 && e.message === 'Unauthorized') {
        chromeExtension.tabs.sendMessageToAllTab({
          type: ExtensionMessageListener.pageEvent,
          data: {
            type: PageEventTypes.LogOut,
          },
          id: getMsgId({ type: PageEventTypes.LogOut }),
        });
      }

      // 强制版本更新
      if (e.status === 400 && e.code === 'force_upgrade_version') {
        chromeExtension.tabs.sendMessageToAllTab({
          type: ExtensionMessageListener.pageEvent,
          data: {
            type: PageEventTypes.ForceUpgradeVersion,
            data: {
              html: e?.html,
            },
          },
          id: getMsgId({ type: PageEventTypes.ForceUpgradeVersion }),
        });
      }

      if (e.code === 20 && e.name === 'AbortError') {
        return { error: HttpClientError.AbortError };
      }

      return { success: false, status: e.status, error: e.code || e.message, data: e.data };
    }
  }

  async uploadFile(url: string, _config: IRequestConfig) {
    const file = await transformUrlToFile(_config.data);
    const formData = new FormData();
    formData.append('file', file);
    const csrfToken = await this.getCsrfToken(YUQUE_DOMAIN, YUQUE_CSRF_COOKIE_NAME);
    const user = (await getCurrentAccount()) as any;
    const query = this.generateQuery({
      attachable_type: 'User',
      attachable_id: user.id,
      type: 'image',
      ctoken: csrfToken,
    });
    const response = await this.handleRequest(
      `${url}${query}`,
      {
        method: 'POST',
        data: formData,
      },
      {
        isFileUpload: true,
      },
    );

    return response;
  }
}
