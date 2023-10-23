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

export interface IRequestConfig {
  baseURL?: string;
  method: IRequestMethod;
  data?: any;
  headers?: HeadersInit;
}

export interface IRequestOptions {
  isFileUpload?: boolean;
}

export interface IOperateRequestData {
  url: string;
  isFileUpload?: boolean;
  config: IRequestConfig;
  options?: IRequestOptions;
}
