declare interface Window {
  __i18n: (text: string, params?: any) => string;
  _yuque_ext_app: any;
}

declare module '*.less' {
  const resource: { [key: string]: string };
  export = resource;
}

declare module '*.png'
declare module '*.jpg'

declare module '*.svg' {
  export default string;
  export const ReactComponent = React.Component;
}

declare function __i18n(text: string, params?: any): string;
