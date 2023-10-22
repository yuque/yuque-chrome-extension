import Chrome from '@/background/core/chrome';

class Storage {
  async update(key: string, data: any) {
    return await Chrome.storage.local.set({
      [key]: data,
    });
  }

  async remove(key: string) {
    return Chrome.storage.local.remove(key);
  }

  async get(key: string) {
    const valueMap = await Chrome.storage.local.get(key);
    return valueMap[key];
  }
}

const storage = new Storage();

export default storage;
