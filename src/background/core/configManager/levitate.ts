import Chrome from '@/background/core/chromeExtension';
import { ContentScriptEvents } from '@/isomorphic/event/contentScript';
import { defaultLevitateConfig, ILevitateConfig, LevitateConfigKey } from '@/isomorphic/constant/levitate';
import { IConfigManagerOption } from '@/isomorphic/background/configManager';
import { STORAGE_KEYS } from '@/config';
import { storage } from '@/isomorphic/storage';

class LevitateConfigManager {
  async get() {
    const config: ILevitateConfig = (await storage.get(STORAGE_KEYS.SETTINGS.LEVITATE_BALL_CONFIG)) || {};

    // 做一次 config 的合并，保证获取时一定包含 config 中的每一个元素
    for (const _key of Object.keys(defaultLevitateConfig)) {
      const key = _key as LevitateConfigKey;
      const value = config[key];
      if (typeof value === 'undefined') {
        config[key] = defaultLevitateConfig[key] as never;
      }
    }

    return config;
  }

  async update(key: string, value: any, option?: IConfigManagerOption) {
    const config = await this.get();
    const result: ILevitateConfig = {
      ...config,
      [key]: value,
    };
    await Chrome.storage.local.set({
      [STORAGE_KEYS.SETTINGS.LEVITATE_BALL_CONFIG]: result,
    });
    this.noticeWebPage(result);
    return result;
  }

  private noticeWebPage(config: ILevitateConfig) {
    // 异步通知页面 config 发生了改变
    Chrome.tabs.query({ status: 'complete' }, tabs => {
      for (const tab of tabs) {
        if (tab.id) {
          Chrome.tabs.sendMessage(tab.id, {
            action: ContentScriptEvents.LevitateConfigChange,
            data: config,
          });
        }
      }
    });
  }
}

export const levitateConfigManager = new LevitateConfigManager();
