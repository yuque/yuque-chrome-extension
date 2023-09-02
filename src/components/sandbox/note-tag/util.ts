import { STORAGE_KEYS } from '@/config';
import Chrome from '@/core/chrome';

export async function getSelectTag(): Promise<number[]> {
  const config = await Chrome.storage.local.get(STORAGE_KEYS.NOTE.SELECT_TAGS);
  return (config[STORAGE_KEYS.NOTE.SELECT_TAGS] || []) as number[];
}

export async function saveSelectTag(ids: number[]) {
  return Chrome.storage.local.set({
    [STORAGE_KEYS.NOTE.SELECT_TAGS]: ids,
  });
}
