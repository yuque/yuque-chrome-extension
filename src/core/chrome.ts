const _globalThis = typeof window !== 'undefined' ? window : global;

const {
  action,
  cookies,
  contextMenus,
  runtime,
  storage,
  tabs,
  webRequest,
  declarativeNetRequest,
  windows,
  downloads,
  scripting,
} = _globalThis.chrome;

export default {
  action,
  cookies,
  contextMenus,
  runtime,
  storage,
  tabs,
  webRequest,
  declarativeNetRequest,
  windows,
  downloads,
  scripting,
};
