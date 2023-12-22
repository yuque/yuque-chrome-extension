import { IWordMarkConfig, WordMarkConfigKey, defaultWordMarkConfig } from '@/isomorphic/constant/wordMark';
import chromeExtension from '@/background/core/chromeExtension';
import { IConfigManagerOption } from '@/isomorphic/background/configManager';
import { ContentScriptEvents } from '@/isomorphic/event/contentScript';
import { STORAGE_KEYS } from '@/config';
import { WordMarkOptionTypeEnum } from '@/isomorphic/constant/wordMark';
import { storage } from '@/isomorphic/storage';

class WordMarkConfigManager {
  async get() {
    const config = await this.getStorageConfig();
    return this.transformConfig(config);
  }

  async update(key: WordMarkConfigKey, value: any, option?: IConfigManagerOption) {
    const config = await this.getStorageConfig();
    const result: IWordMarkConfig = {
      ...config,
      [key]: value,
    };
    await chromeExtension.storage.local.set({
      [STORAGE_KEYS.SETTINGS.WORD_MARK_CONFIG]: result,
    });
    this.noticeWebPage(result, option);
    return result;
  }

  private noticeWebPage(config: IWordMarkConfig, option?: IConfigManagerOption) {
    const { notice = false } = option || {};
    if (!notice) {
      return;
    }
    // 异步通知页面 wordMarkConfig 发生了改变
    chromeExtension.tabs.query({ status: 'complete' }, tabs => {
      for (const tab of tabs) {
        if (tab.id) {
          chromeExtension.tabs.sendMessage(tab.id, {
            action: ContentScriptEvents.WordMarkConfigChange,
            data: this.transformConfig(config),
          });
        }
      }
    });
  }

  private async getStorageConfig() {
    const config: IWordMarkConfig = (await storage.get(STORAGE_KEYS.SETTINGS.WORD_MARK_CONFIG)) || {};

    // 做一次 config 的合并，保证获取时一定包含 config 中的每一个元素
    for (const _key of Object.keys(defaultWordMarkConfig)) {
      const key = _key as keyof IWordMarkConfig;
      const value = config[key];
      if (typeof value === 'undefined') {
        config[key] = defaultWordMarkConfig[key] as never;
      }

      // 由于历史数据可能被写入 string 或者 string[] 如果判断出是这种数据的，将内容置空
      if (key === 'disableUrl') {
        const tempValue = config[key];
        if (typeof tempValue === 'string' || typeof tempValue?.[0] === 'string') {
          config[key] = [];
        }
      }

      /**
       * 当缓存中的 toolbars 长度和默认不一致时，说明扩展了 toolbars
       * 然后将新增的 toolbars 扩展到缓存的最后
       */
      if (key === 'toolbars' && value && config[key].length !== defaultWordMarkConfig.toolbars.length) {
        const newAddToolbars: WordMarkOptionTypeEnum[] = [];
        for (const item of defaultWordMarkConfig.toolbars) {
          if (!config[key].includes(item)) {
            newAddToolbars.push(item);
          }
        }
        if (newAddToolbars.length) {
          config[key] = config[key].concat(newAddToolbars);
        }
      }
    }
    return config;
  }

  private transformConfig(config: IWordMarkConfig) {
    const disableFunction = config.disableFunction;

    const result = {
      ...config,
      filterInnerPinList: config.innerPinList.filter(item => !disableFunction.includes(item)),
      filterToolbars: config.toolbars.filter(item => !disableFunction.includes(item)),
    };
    return result;
  }
}

export const wordMarkConfigManager = new WordMarkConfigManager();
