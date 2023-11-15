import { levitateConfigManager } from '@/background/core/configManager/levitate';
import {
  IOperateConfigManagerData,
  OperateConfigManagerEnum,
} from '@/isomorphic/background/configManager';
import { wordMarkConfigManager } from '../core/configManager/wordMark';
import { clipConfigManager } from '../core/configManager/clip';
import { RequestMessage } from './index';

const managerMap = {
  wordMark: wordMarkConfigManager,
  levitate: levitateConfigManager,
  clip: clipConfigManager,
};

export async function createManagerConfigActionListener(
  request: RequestMessage<IOperateConfigManagerData>,
  callback: (params: any) => void,
) {
  const { type, value, key, managerType, option = {} } = request.data;
  const manage = managerMap[managerType];
  switch (type) {
    case OperateConfigManagerEnum.get: {
      const result = await manage.get();
      callback(result);
      break;
    }
    case OperateConfigManagerEnum.update: {
      const res = await manage.update(key as any, value, option);
      callback(res);
      break;
    }
    default: {
      break;
    }
  }
}
