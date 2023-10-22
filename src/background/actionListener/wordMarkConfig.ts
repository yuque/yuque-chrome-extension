import { RequestMessage } from './index';
import {
  IOperateWordMarkConfigData,
  OperateWordConfigMarkEnum,
} from '@/isomorphic/background/wordMarkConfig';
import { wordMarkConfigManager } from '@/background/core/wordMarkConfig';

export async function createWordMarkConfigActionListener(
  request: RequestMessage<IOperateWordMarkConfigData>,
  callback: (params: any) => void,
) {
  const { type, value, key, option } = request.data;
  switch (type) {
    case OperateWordConfigMarkEnum.get: {
      const result = await wordMarkConfigManager.get();
      callback(result);
      break;
    }
    case OperateWordConfigMarkEnum.update: {
      const res = await wordMarkConfigManager.update(key, value, option);
      callback(res);
      break;
    }
    default: {
      break;
    }
  }
}
