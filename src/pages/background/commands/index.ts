import Chrome from '@/core/chrome';
import { OpenSelect } from './OpenSelect';
import { SELECT_TYPE_AREA, SELECT_TYPE_BOOKMARK } from '@/pages/sandbox/constants/select-types';

export type ChromeExtCommand = (tab: chrome.tabs.Tab) => void;

/**
 * 插件全局已经注册的命令 map
 */
const registeredCommands: Record<string, ChromeExtCommand> = {
  OnAreaSelect: (tab: chrome.tabs.Tab) => {
    OpenSelect(tab, SELECT_TYPE_AREA);
  },
  OnBookmarkSelect: (tab: chrome.tabs.Tab) => {
    OpenSelect(tab, SELECT_TYPE_BOOKMARK);
  },
};


/**
 * 插件生命周期开始时应用插件命令
 */
export const applyExtCommands = () => {
  Chrome.commands.onCommand.addListener((command, tab) => {
    const callback = registeredCommands[command];
    if (callback) {
      callback(tab);
    } else {
      console.warn(`-- no command found for ${command}`);
    }
  });
  console.log('applyExtCommands 命令注册成功');
};
