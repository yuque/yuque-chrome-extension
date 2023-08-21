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
};

// 在 background.js 里面监听的事件
export const BACKGROUND_EVENTS = {
  UPDATE_WORD_MARK_PIN: 'background/update-word-mark-pin',
  GET_WORD_MARK_PIN: 'background/get-word-mark-pin',
  WORD_MARK_EXECUTE_COMMAND: 'background/word-mark-execute-command',
  SAVE_TO_NOTE: 'background/save-to-note',
};
