import { IOperateStorageData, OperateStorageEnum } from '@/isomorphic/background/storage';
import { storage } from '@/isomorphic/storage';
import { RequestMessage } from './index';

export async function createStorageActionListener(
  request: RequestMessage<IOperateStorageData>,
  callback: (params: any) => void,
  sender: chrome.runtime.MessageSender,
) {
  const { type, key, data } = request.data;
  switch (type) {
    case OperateStorageEnum.get: {
      const res = await storage.get(key);
      callback(res);
      break;
    }
    case OperateStorageEnum.remove: {
      const res = await storage.remove(key);
      callback(res);
      break;
    }
    case OperateStorageEnum.update: {
      const res = await storage.update(key, data);
      callback(res);
      break;
    }
    default: {
      break;
    }
  }
}
