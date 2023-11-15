import { ClipConfigKey } from '../constant/clip';
import { LevitateConfigKey } from '../constant/levitate';
import { WordMarkConfigKey } from '../constant/wordMark';

export enum OperateConfigManagerEnum {
  get = 'get',
  update = 'update',
}

export type ManagerKey = {
  wordMark: WordMarkConfigKey;
  levitate: LevitateConfigKey;
  clip: ClipConfigKey;
};

export type ManagerType = keyof ManagerKey;

export interface IConfigManagerOption {
  notice?: boolean;
}

export interface IOperateConfigManagerData {
  managerType: ManagerType;
  type: OperateConfigManagerEnum;
  key: ManagerKey[ManagerType];
  value?: any;
  option?: IConfigManagerOption;
}
