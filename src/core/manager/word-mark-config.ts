import {
  WordMarkConfigKey,
  IWordMarkConfig,
  defaultWordMarkConfig,
} from '@/isomorphic/word-mark';
import Chrome from '@/core/chrome';
import { STORAGE_KEYS } from '@/config';
import { PAGE_EVENTS } from '@/events';

interface IOption {
  notice?: boolean;
}

class WordMarkConfigManager {
  async get() {
    const res = await Chrome.storage.local.get(
      STORAGE_KEYS.SETTINGS.WORD_MARK_CONFIG,
    );
    const config: IWordMarkConfig =
      res[STORAGE_KEYS.SETTINGS.WORD_MARK_CONFIG] || {};

    // 做一次 config 的合并，保证获取时一定包含 config 中的每一个元素
    for (const key of Object.keys(defaultWordMarkConfig)) {
      const value = config[key];
      if (typeof value === 'undefined') {
        config[key] = defaultWordMarkConfig[key];
      }
    }

    return config;
  }

  async update(key: WordMarkConfigKey, value: any, option?: IOption) {
    const config = await this.get();
    const result: IWordMarkConfig = {
      ...config,
      [key]: value,
    };

    // enable 改变时，将 disable url 全部清空
    if (key === WordMarkConfigKey.enable) {
      result.disableUrl = [];
    }
    await Chrome.storage.local.set({
      [STORAGE_KEYS.SETTINGS.WORD_MARK_CONFIG]: result,
    });
    this.noticeWebPage(config, option);
    return result;
  }

  private noticeWebPage(config: IWordMarkConfig, option: IOption) {
    const { notice = false } = option;
    if (!notice) {
      return;
    }
    // 异步通知页面 wordMarkConfig 发生了改变
    Chrome.tabs.query({ status: 'complete' }, tabs => {
      for (const tab of tabs) {
        Chrome.tabs.sendMessage(tab.id, {
          action: PAGE_EVENTS.ENABLE_WORD_MARK_STATUE_CHANGE,
          data: config,
        });
      }
    });
  }
}

export const wordMarkConfigManager = new WordMarkConfigManager();
