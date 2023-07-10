import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import Chrome from '@/core/chrome';
import {
  pkg,
  REQUEST_HEADER_VERSION,
  YUQUE_DOMAIN,
  YUQUE_CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from '@/config';

export class CsrfTokenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CsrfTokenError';
  }
}

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
  };
  const csrfToken = await getCsrfToken(YUQUE_DOMAIN, YUQUE_CSRF_COOKIE_NAME);
  if (csrfToken) {
    headers[CSRF_HEADER_NAME] = csrfToken;
  } else {
    throw new CsrfTokenError('csrf token not found');
  }
  return headers;
};

const request = async (
  url: string,
  options: AxiosRequestConfig = {},
  isFileUpload = false,
): Promise<AxiosResponse> => {
  try {
    const headers = await prepareHeaders();
    const defaultOptions: AxiosRequestConfig = {
      headers,
      timeout: 3e3,
    };
    defaultOptions.baseURL = YUQUE_DOMAIN;
    const newOptions: AxiosRequestConfig = {
      validateStatus: status => status >= 200 && status < 300,
      withCredentials: true,
      url,
      ...defaultOptions,
      ...options,
    };

    if (
      !isFileUpload &&
      (newOptions.method === 'POST' || newOptions.method === 'PUT')
    ) {
      newOptions.headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...newOptions.headers,
      };
    } else if (isFileUpload) {
      newOptions.headers = {
        'Content-Type': 'multipart/form-data',
        ...newOptions.headers,
      };
    }

    return axios(newOptions);
  } catch (error) {
    throw error;
  }
};

const uploadFile = async (
  url: string,
  file: File,
  attachableId: number,
  attachableType = 'Note',
  fileType = 'image',
): Promise<AxiosResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const csrfToken = await getCsrfToken(YUQUE_DOMAIN, YUQUE_CSRF_COOKIE_NAME);
  const response = await request(
    url,
    {
      method: 'POST',
      data: formData,
      params: {
        attachable_type: attachableType,
        attachable_id: attachableId,
        type: fileType,
        ctoken: csrfToken,
      },
    },
    true,
  );

  return response;
};

export default request;
export { uploadFile };
