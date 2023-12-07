import { backgroundBridge } from '@/core/bridge/background';
import Env from './env';

class Storage {
  async update(key: string, data: any) {
    if (Env.isBackground) {
      const res = await chrome.storage.local.set({
        [key]: data,
      });
      return res;
    }
    const res = await backgroundBridge.storage.update(key, data);
    return res;
  }

  async remove(key: string) {
    if (Env.isBackground) {
      const res = await chrome.storage.local.remove(key);
      return res;
    }
    const res = await backgroundBridge.storage.remove(key);
    return res;
  }

  async get(key: string) {
    if (Env.isBackground) {
      const valueMap = await chrome.storage.local.get(key);
      return valueMap[key];
    }
    const res = await backgroundBridge.storage.get(key);
    return res;
  }
}

export const storage = new Storage();
