export const GLOBAL_EVENTS = {
  SHOW_BOARD: 'global/show-board',
  CLOSE_BOARD: 'global/close-board',
  GET_PAGE_HTML: 'global/get-page-html',
  GET_SELECTED_HTML: 'global/get-selected-html',
  GET_SELECTED_TEXT: 'global/get-selected-text',
  START_SELECT: 'global/start-select',
  SAVE_TO_NOTE: 'global/save-to-note',
  SAVE_TO_NOTE_IMAGE: 'global/save-to-note-image',
};

export const PAGE_EVENTS = {
  AREA_SELECTED: 'page/area-selected',
  DISABLE_WORD_MARK: 'page/disable-word-mark',
  FORCE_UPGRADE_VERSION: 'background/force-upgrade-version',
};

// 在 background.js 里面监听的事件
export const BACKGROUND_EVENTS = {
  WORD_MARK_EXECUTE_COMMAND: 'background/word-mark-execute-command',
  SAVE_TO_NOTE: 'background/save-to-note',
  SAVE_TO_BOOK: 'background/save-to-book',
  GET_WORD_MARK_CONFIG: 'background/get-word-mark-config',
  UPDATE_WORD_MARK_CONFIG: 'background/update-word-mark-config',
  OPEN_SETTING_PAGE: 'background/open-setting-page',
};

