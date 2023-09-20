import Chrome from '@/core/chrome';
import {
  pkg,
  REQUEST_HEADER_VERSION,
  YUQUE_DOMAIN,
  YUQUE_CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  EXTENSION_ID,
} from '@/config';
import 'whatwg-fetch';
import { PAGE_EVENTS } from '@/events';
import eventManager from './event/eventManager';
import { AppEvents } from './event/events';
import { getCurrentAccount } from './account';

export class CsrfTokenError extends Error {
  constructor(message) {
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
      resolve(cookie);
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

export type Method =
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

interface IConfig {
  baseURL?: string;
  method: Method;
  data?: any;
  headers?: HeadersInit;
}

async function request<T>(
  url: string,
  config: IConfig,
  isFileUpload = false,
): Promise<{ status: number; data: T }> {
  try {
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
      const paramsArray = [];
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
      if (typeof window !== 'undefined') {
        eventManager.notify(AppEvents.FORCE_UPGRADE_VERSION, {
          html: responseJson?.html,
        });
      } else {
        Chrome.tabs.query({ active: true }, tabs => {
          Chrome.tabs.sendMessage(tabs[0].id, {
            action: PAGE_EVENTS.FORCE_UPGRADE_VERSION,
          });
        });
      }
      throw responseJson;
    }
    // 登录过期
    if (response.status === 401 && responseJson.message === 'Unauthorized') {
      if (typeof window !== 'undefined') {
        eventManager.notify(AppEvents.LOGIN_EXPIRED);
      } else {
        Chrome.tabs.query({ active: true }, tabs => {
          Chrome.tabs.sendMessage(tabs[0].id, {
            action: PAGE_EVENTS.LOGIN_EXPIRED,
          });
        });
      }
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
  const user = await getCurrentAccount();
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
    true,
  );

  return response;
}

export default request;
