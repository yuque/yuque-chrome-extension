import { STORAGE_KEYS } from '@/config';
import { storage } from '@/isomorphic/storage';
import { ConfigManagerBase } from './base';

export type ILevitateConfig = {
  disableUrl: Array<{
    origin: string;
    icon: string;
  }>;
  position: string;
  enable: boolean;
};

export type LevitateConfigKey = keyof ILevitateConfig;

class LevitateConfigManager extends ConfigManagerBase {
  public configKey: string = STORAGE_KEYS.SETTINGS.LEVITATE_BALL_CONFIG;
  protected defaultConfig: ILevitateConfig = {
    enable: true,
    disableUrl: [],
    position: '',
  };

  async get() {
    const config: ILevitateConfig = (await storage.get(this.configKey)) || {};
    const result = this.mergerBaseConfig(config) as ILevitateConfig;
    return result;
  }

  async update(key: LevitateConfigKey, value: ILevitateConfig[LevitateConfigKey]) {
    const config = await this.get();
    const result: ILevitateConfig = {
      ...config,
      [key]: value,
    };
    await storage.update(this.configKey, result);
    return result;
  }
}

export const levitateConfigManager = new LevitateConfigManager();
