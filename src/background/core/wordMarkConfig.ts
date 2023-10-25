import {
  WordMarkConfigKey,
  IWordMarkConfig,
  defaultWordMarkConfig,
} from '@/isomorphic/constant/wordMark';
import Chrome from '@/background/core/chrome';
import { IWordMarkConfigOption } from '@/isomorphic/background/wordMarkConfig';
import { ContentScriptEvents } from '@/isomorphic/event/contentScript';
import { STORAGE_KEYS } from '@/config';
import Storage from './storage';

class WordMarkConfigManager {
  async get() {
    const config: IWordMarkConfig =
      (await Storage.get(STORAGE_KEYS.SETTINGS.WORD_MARK_CONFIG)) || {};

    // 做一次 config 的合并，保证获取时一定包含 config 中的每一个元素
    for (const _key of Object.keys(defaultWordMarkConfig)) {
      const key = _key as keyof IWordMarkConfig;
      const value = config[key];
      if (typeof value === 'undefined') {
        config[key] = defaultWordMarkConfig[key] as any;
      }
    }

    return config;
  }

  async update(
    key: WordMarkConfigKey,
    value: any,
    option?: IWordMarkConfigOption,
  ) {
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
    this.noticeWebPage(result, option);
    return result;
  }

  private noticeWebPage(
    config: IWordMarkConfig,
    option?: IWordMarkConfigOption,
  ) {
    const { notice = false } = option || {};
    if (!notice) {
      return;
    }
    // 异步通知页面 wordMarkConfig 发生了改变
    Chrome.tabs.query({ status: 'complete' }, tabs => {
      for (const tab of tabs) {
        if (tab.id) {
          Chrome.tabs.sendMessage(tab.id, {
            action: ContentScriptEvents.WordMarkConfigChange,
            data: config,
          });
        }
      }
    });
  }
}

export const wordMarkConfigManager = new WordMarkConfigManager();
