declare interface Window {
  __i18n: (text: string, params?: any) => string;
  _yuque_ext_app: any;
}

declare module '*.less' {
  const resource: { [key: string]: string };
  export = resource;
}

declare function __i18n(text: string, params?: any): string;
