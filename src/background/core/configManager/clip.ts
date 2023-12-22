import Chrome from '@/background/core/chromeExtension';
import { STORAGE_KEYS } from '@/config';
import { defaultClipConfig, IClipConfig, ClipConfigKey } from '@/isomorphic/constant/clip';
import { IConfigManagerOption } from '@/isomorphic/background/configManager';
import { storage } from '@/isomorphic/storage';

class ClipConfigManager {
  async get() {
    const config: IClipConfig = (await storage.get(STORAGE_KEYS.SETTINGS.CLIP_CONFIG)) || {};

    // 做一次 config 的合并，保证获取时一定包含 config 中的每一个元素
    for (const _key of Object.keys(defaultClipConfig)) {
      const key = _key as ClipConfigKey;
      const value = config[key];
      if (typeof value === 'undefined') {
        config[key] = defaultClipConfig[key] as never;
      }
    }

    return config;
  }

  async update(key: string, value: any, option?: IConfigManagerOption) {
    const config = await this.get();
    const result: IClipConfig = {
      ...config,
      [key]: value,
    };
    await Chrome.storage.local.set({
      [STORAGE_KEYS.SETTINGS.CLIP_CONFIG]: result,
    });
    return result;
  }
}

export const clipConfigManager = new ClipConfigManager();
