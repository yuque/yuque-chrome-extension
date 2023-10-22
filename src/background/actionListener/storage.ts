import {
  IOperateStorageData,
  OperateStorageEnum,
} from '@/isomorphic/background/storage';
import Storage from '@/background/core/storage';
import { RequestMessage } from './index';

export async function createStorageActionListener(
  request: RequestMessage<IOperateStorageData>,
  callback: (params: any) => void,
) {
  const { type, key, data } = request.data;
  switch (type) {
    case OperateStorageEnum.get: {
      const res = await Storage.get(key);
      callback(res);
      break;
    }
    case OperateStorageEnum.remove: {
      const res = await Storage.remove(key);
      callback(res);
      break;
    }
    case OperateStorageEnum.update: {
      const res = await Storage.update(key, data);
      callback(res);
      break;
    }
    default: {
      break;
    }
  }
}
