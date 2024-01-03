import { PageEventTypes } from '@/isomorphic/event/pageEvent';
import { pageEvent } from '../event/pageEvent';

export abstract class ConfigManagerBase {
  protected abstract configKey: string;
  protected abstract defaultConfig: Record<string, any>;
  private listeners: Array<(params: Record<string, any>) => void> = [];
  private isListening = false;

  private initListener() {
    if (this.isListening) {
      return;
    }
    this.isListening = true;
    pageEvent.addListener(PageEventTypes.StorageUpdate, (data: Record<string, any>) => {
      if (data?.key === this.configKey) {
        this.listeners.forEach(fn => {
          fn(data.value);
        });
      }
    });
  }

  mergerBaseConfig(config: Record<string, any>) {
    const result: Record<string, any> = {};
    // 做一次 config 的合并，保证获取时一定包含 config 中的每一个元素
    for (const key of Object.keys(this.defaultConfig)) {
      const value = config[key];
      result[key] = value;
      if (typeof result[key] === 'undefined') {
        result[key] = this.defaultConfig[key];
      }
    }
    return result;
  }

  addListener(fn: (params: Record<string, any>) => void) {
    this.initListener();
    this.listeners.push(fn);
    return () => {
      const index = this.listeners.indexOf(fn);
      this.listeners.splice(index, 1);
    };
  }
}
