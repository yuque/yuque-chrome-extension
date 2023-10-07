import { STORAGE_KEYS } from '@/config';
import Chrome from '@/core/chrome';
import eventManager from '@/core/event/eventManager';
import { AppEvents } from '@/core/event/events';
import { GLOBAL_EVENTS } from '@/events';
import { StartSelectEnum } from '@/isomorphic/constants';

const blockquoteID = 'yqextensionblockquoteid';

/**
 * 获取文档开头的html片段
 * @param tab 浏览器当前的tab
 * @param useQuote 是否添加引用
 * @param needHeading 是否添加标题
 * @return {string} html片段
 */
export const getBookmarkHtml = (
  tab: chrome.tabs.Tab,
  useQuote = false,
  needHeading = true,
) => {
  const ret = [];
  if (needHeading) {
    ret.push(`<h2>${tab.title}</h2>`);
  }
  if (useQuote) {
    ret.push(
      `<blockquote><p>来自: <a href="${tab.url}">${tab.title}</a></p></blockquote>`,
    );
  } else {
    ret.push(`<p><a href="${tab.url}">${tab.title}</a></p>`);
  }
  return ret.join('');
};

/**
 * 获取文档开头的html片段
 * @param tab 浏览器当前的tab
 * @return {heading: string, quote: string} html片段
 */
export const getBookmarkHTMLs = (tab: chrome.tabs.Tab) => {
  const heading = `<h2>${tab.title}</h2>`;
  const quote = `<p><br></p><blockquote id="${blockquoteID}"><p>来自: <a href="${tab.url}">${tab.title}</a></p></blockquote>`;
  return {
    heading,
    quote,
  };
};

/**
 * 获取追加的html片段
 * @param tab 浏览器当前的tab
 * @return {string} html片段
 */
export const getCitation = (tab: chrome.tabs.Tab) => {
  return `<p>来自: <a href="${tab.url}">${tab.url}</a></p>`;
};

/**
 * 获取当前浏览器的tab
 */
export const getCurrentTab = (): Promise<chrome.tabs.Tab> =>
  new Promise(resolve => {
    Chrome.tabs.getCurrent(tab => {
      resolve(tab as chrome.tabs.Tab);
    });
  });

/**
 * 开始选择需要剪藏的内容
 */
export const startSelect = (type: StartSelectEnum) => {
  getCurrentTab().then(tab => {
    Chrome.tabs.sendMessage(tab.id as number, {
      action: GLOBAL_EVENTS.START_SELECT,
      data: {
        type,
      },
    });
  });
};

/**
 * 关闭 sandbox
 */
export const onSandboxClose = () => {
  Chrome.tabs.getCurrent((tab: any) => {
    Chrome.tabs.sendMessage(tab.id, {
      action: GLOBAL_EVENTS.CLOSE_BOARD,
    });
  });
  eventManager.notify(AppEvents.CLOSE_BOARD);
};

export const updateUserSavePosition = async (book: any) => {
  await Chrome.storage.local.set({
    [STORAGE_KEYS.USER.CLIPPING_SAVE_POSITION]: book,
  });
};

export const getUserSavePosition = async () => {
  const storage = await Chrome.storage.local.get(
    STORAGE_KEYS.USER.CLIPPING_SAVE_POSITION,
  );
  return (
    storage[STORAGE_KEYS.USER.CLIPPING_SAVE_POSITION] || {
      id: 0,
      type: 'Note',
      get name() {
        return __i18n('小记');
      },
    }
  );
};
