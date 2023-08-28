export const GLOBAL_EVENTS = {
  GET_SELECTED_TEXT: 'global/get-selected-text',
  SAVE_TO_NOTE_IMAGE: 'global/save-to-note-image',
};

export const PAGE_EVENTS = {
  AREA_SELECTED: 'page/area-selected',
  ENABLE_WORD_MARK_STATUE_CHANGE: 'page/enable-word-mark-statue-change',
  FORCE_UPGRADE_VERSION: 'page/force-upgrade-version',
  WORD_MARK_CLIP: 'page/word-mark-clip',
  LOGIN_EXPIRED: 'page/login-expired',
  SHOW_CLIPPING_BOARD:'page/show-clipping-board',
  LOGIN_SUCCESS: 'page/login-success',
  SAVE_TO_NOTE: 'page/save-to-note',
  GET_SELECTED_TEXT: 'page/get-selected-text',
};

// 在 background.js 里面监听的事件
export const BACKGROUND_EVENTS = {
  WORD_MARK_EXECUTE_COMMAND: 'background/word-mark-execute-command',
  SAVE_TO_NOTE: 'background/save-to-note',
  SAVE_TO_BOOK: 'background/save-to-book',
  GET_MINE_BOOK: 'background/get-mine-book',
  GET_WORD_MARK_CONFIG: 'background/get-word-mark-config',
  UPDATE_WORD_MARK_CONFIG: 'background/update-word-mark-config',
  OPEN_SETTING_PAGE: 'background/open-setting-page',
  GET_CURRENT_ACCOUNT_INFO: 'background/get-current-account-info',
  REQUEST_LOGIN: 'background/request-login',
  REQUEST_LOGOUT: 'background/request-logout',
  GET_MINE_TAG: 'background/get-mine-tag',
  CREATE_TAG: 'background/create-tag',
};

