import Chrome from '@/background/core/chrome';
import {
  pkg,
  REQUEST_HEADER_VERSION,
  YUQUE_DOMAIN,
  YUQUE_CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  EXTENSION_ID,
} from '@/config';
import 'whatwg-fetch';
import {
  IRequestConfig,
  IRequestOptions,
} from '@/isomorphic/background/request';
import { ContentScriptEvents } from '@/isomorphic/contentScript';
import { getCurrentAccount } from './util';

export class CsrfTokenError extends Error {
  constructor(message: any) {
    super(message);
    this.name = 'CsrfTokenError';
  }
}

const generateQuery = (params: { [key: string]: any }) => {
  return `?${new URLSearchParams(params).toString()}`;
};

const setCsrfToken = (
  domain: string,
  cookieName: string,
  value: string,
): Promise<chrome.cookies.Cookie> => {
  return new Promise(resolve => {
    Chrome.cookies.set({ url: domain, name: cookieName, value }, cookie => {
      resolve(cookie as chrome.cookies.Cookie);
    });
  });
};

const generateRandomToken = (): string => {
  return Math.random().toString(36).substring(2);
};

export const getCsrfToken = async (
  domain: string,
  cookieName: string,
): Promise<string> => {
  return new Promise(resolve => {
    Chrome.cookies.get({ url: domain, name: cookieName }, cookie => {
      if (cookie) {
        resolve(cookie.value);
      } else {
        const randomToken = generateRandomToken();
        setCsrfToken(domain, cookieName, randomToken).then(newCookie => {
          resolve(newCookie.value);
        });
      }
    });
  });
};

const prepareHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    [REQUEST_HEADER_VERSION]: pkg.version,
    [EXTENSION_ID]: Chrome.runtime.id,
  };
  const csrfToken = await getCsrfToken(YUQUE_DOMAIN, YUQUE_CSRF_COOKIE_NAME);
  if (csrfToken) {
    headers[CSRF_HEADER_NAME] = csrfToken;
  } else {
    throw new CsrfTokenError('csrf token not found');
  }
  return headers;
};

async function request<T>(
  url: string,
  config: IRequestConfig,
  _option?: IRequestOptions,
): Promise<{ status: number; data: T }> {
  try {
    const { isFileUpload } = _option || {};
    const headers = await prepareHeaders();
    let queryString = '';
    const options: RequestInit = {
      headers: {
        ...headers,
        ...config.headers,
      },
      method: config.method,
      ...config,
    };
    if (isFileUpload) {
      options.body = config.data;
    } else if (options.method === 'POST' || options.method === 'PUT') {
      options.headers = {
        'Content-Type': 'application/json; charset=UTF-8',
        Accept: 'application/json',
        ...options.headers,
      };
      options.body = JSON.stringify(config.data);
    } else if (options.method === 'GET' && config.data) {
      const params = config.data;
      const paramsArray: string[] = [];
      Object.keys(params).forEach(key =>
        paramsArray.push(`${key}=${params[key]}`),
      );
      if (paramsArray.length > 0) {
        queryString = `?${paramsArray.join('&')}`;
      }
    }
    const baseURL = config.baseURL || YUQUE_DOMAIN;
    const response = await fetch(`${baseURL}${url}${queryString}`, {
      ...options,
    });
    const responseJson = await response.json();
    if (
      responseJson.status === 400 &&
      responseJson.code === 'force_upgrade_version'
    ) {
      Chrome.sendMessageToAllTab({
        action: ContentScriptEvents.ForceUpgradeVersion,
        data: {
          html: responseJson?.html,
        }
      })
      throw responseJson;
    }
    // 登录过期
    if (response.status === 401 && responseJson.message === 'Unauthorized') {
      Chrome.sendMessageToAllTab({
        action: ContentScriptEvents.LoginOut,
      })
      throw responseJson;
    }
    if (!(response.status >= 200 && response.status < 300)) {
      throw responseJson;
    }
    return { status: response.status, data: responseJson };
  } catch (e) {
    throw e;
  }
}

export async function uploadFile(
  url: string,
  file: File,
  attachableType = 'User',
  fileType = 'image',
) {
  const formData = new FormData();
  formData.append('file', file);
  const csrfToken = await getCsrfToken(YUQUE_DOMAIN, YUQUE_CSRF_COOKIE_NAME);
  const user = await getCurrentAccount() as any;
  const query = generateQuery({
    attachable_type: attachableType,
    attachable_id: user.id,
    type: fileType,
    ctoken: csrfToken,
  });
  const response = await request(
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

export default request;
