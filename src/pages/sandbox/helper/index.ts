import Chrome from '@/core/chrome';
import { get as safeGet } from 'lodash';
import proxy from '@/core/proxy';
import { GLOBAL_EVENTS } from '@/events';

/**
 * 获取文档开头的html片段
 * @param tab 浏览器当前的tab
 * @param useQuote 是否添加引用
 * @param needHeading 是否添加标题
 * @return {string} html片段
 */
export const getBookmarkHtml = (tab: chrome.tabs.Tab, useQuote = false, needHeading = true) => {
  const ret = [];
  if (needHeading) {
    ret.push(`<h2>${tab.title}</h2>`);
  }
  if (useQuote) {
    ret.push(`<blockquote><p>来自: <a href="${tab.url}">${tab.title}</a></p></blockquote><p><br/></p>`);
  } else {
    ret.push(`<p><a href="${tab.url}">${tab.title}</a></p>`);
  }
  return ret.join('');
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
      resolve(tab);
    });
  });

/**
 * 获取小记的id
 */
export const getNoteId = async (): Promise<string> => {
  const noteStatusResponse = await proxy.note.getStatus();
  const noteId = safeGet(noteStatusResponse, 'data.meta.mirror.id');
  return noteId;
};

/**
 * 开始选择需要剪藏的内容
 */
export const startSelect = () => {
  getCurrentTab().then(tab => {
    Chrome.tabs.sendMessage(tab.id, {
      action: GLOBAL_EVENTS.START_SELECT,
    });
  });
};
