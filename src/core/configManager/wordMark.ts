import { STORAGE_KEYS } from '@/config';
import { storage } from '@/isomorphic/storage';
import { ISavePosition } from '../webProxy/mine';
import { ConfigManagerBase } from './base';

// 划词操作类型
export enum WordMarkOptionTypeEnum {
  /**
   * 翻译
   */
  translate = 'translate',

  /**
   * 剪藏
   */
  clipping = 'clipping',
}

export type IWordMarkConfig = {
  // 是否开启
  enable: boolean;

  // 剪藏默认存储地址
  defaultSavePosition: ISavePosition;

  // 划词置顶的操作
  innerPinList: Array<WordMarkOptionTypeEnum>;

  // 禁用页面的 url
  disableUrl: Array<{ origin: string; icon: string }>;

  // 剪藏时唤起面板
  evokePanelWhenClip: boolean;

  // 剪藏面板的排序规则
  toolbars: Array<WordMarkOptionTypeEnum>;

  // 换次面板快捷键
  evokeWordMarkShortKey: string;

  // 用户关闭的划词的某个功能
  disableFunction: Array<WordMarkOptionTypeEnum>;
};

export type WordMarkConfigKey = keyof IWordMarkConfig;

export interface ITransformWordMarkConfig extends IWordMarkConfig {
  filterInnerPinList: WordMarkOptionTypeEnum[];
  filterToolbars: WordMarkOptionTypeEnum[];
}

class WordMarkConfigManager extends ConfigManagerBase {
  protected configKey: string = STORAGE_KEYS.SETTINGS.WORD_MARK_CONFIG;
  protected defaultConfig: IWordMarkConfig = {
    enable: false,
    defaultSavePosition: {
      type: 'Note',
      id: 0,
      name: '小记',
    },
    innerPinList: [WordMarkOptionTypeEnum.clipping, WordMarkOptionTypeEnum.translate],
    disableUrl: [],
    evokePanelWhenClip: false,
    toolbars: [WordMarkOptionTypeEnum.clipping, WordMarkOptionTypeEnum.translate],
    evokeWordMarkShortKey: '',
    disableFunction: [],
  };

  async get() {
    const config = await this.getStorageConfig();

    return this.transformConfig(config);
  }

  async update(key: WordMarkConfigKey, value: IWordMarkConfig[WordMarkConfigKey]) {
    const config = await this.getStorageConfig();
    const result: IWordMarkConfig = {
      ...config,
      [key]: value,
    };
    await storage.update(this.configKey, result);
    return result;
  }

  private async getStorageConfig() {
    const config: IWordMarkConfig = (await storage.get(this.configKey)) || {};

    const result = this.mergerBaseConfig(config) as IWordMarkConfig;

    // 由于历史数据可能被写入 string 或者 string[] 如果判断出是这种数据的，将内容置空
    if (typeof result.disableUrl === 'string' || typeof result.disableUrl?.[0] === 'string') {
      result.disableUrl = [];
    }

    /**
     * 当缓存中的 toolbars 长度和默认不一致时，说明扩展了 toolbars
     * 然后将新增的 toolbars 扩展到缓存的最后
     */
    if (result.toolbars.length !== this.defaultConfig.toolbars.length) {
      const newAddToolbars: WordMarkOptionTypeEnum[] = [];
      for (const item of this.defaultConfig.toolbars) {
        if (!result.toolbars.includes(item)) {
          newAddToolbars.push(item);
        }
      }
      if (newAddToolbars.length) {
        result.toolbars = result.toolbars.concat(newAddToolbars);
      }
    }

    return result;
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

  addListener(fn: (params: ITransformWordMarkConfig) => void) {
    const removeListener = super.addListener(data => {
      fn(this.transformConfig(data as IWordMarkConfig));
    });
    return removeListener;
  }
}

export const wordMarkConfigManager = new WordMarkConfigManager();
