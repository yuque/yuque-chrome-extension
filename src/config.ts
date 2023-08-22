import pkgJSON from '../package.json';

export const pkg = pkgJSON;

const hyphen = '-';
const prefix = 'x';
export const siteName = pkgJSON.name.split(hyphen)[0];
export const REQUEST_HEADER_VERSION = `${prefix}${hyphen}${pkgJSON.name}${hyphen}version`;
export const CSRF_HEADER_NAME = [ 'x', 'csrf', 'token' ].join('-');
export const STORAGE_KEYS = {
  CURRENT_ACCOUNT: 'storage/current-account',
  SETTINGS: {
    WORD_MARK_CONFIG: 'settings/word-mark-config',
  }
};
export const YUQUE_DOMAIN = 'https://www.yuque.com';
export const YUQUE_CSRF_COOKIE_NAME = 'yuque_ctoken';
export const EXTENSION_ID = 'extension-id';
export const VERSION = pkgJSON.version;
export const REFERER_URL = 'referer_url';
export const TRACERT_CONFIG = {
  spmAPos: 'a385',
  spmBPos: 'b65721',
};
