import { LevitateConfigKey } from '../constant/levitate';
import { WordMarkConfigKey } from '../constant/wordMark';

export enum OperateConfigManagerEnum {
  get = 'get',
  update = 'update',
}

export type ManagerType = 'wordMark' | 'levitate';
export type ManagerKey = WordMarkConfigKey | LevitateConfigKey;

export interface IConfigManagerOption {
  notice?: boolean;
}

export interface IOperateConfigManagerData {
  managerType: ManagerType;
  type: OperateConfigManagerEnum;
  key: ManagerKey;
  value?: any;
  option?: IConfigManagerOption;
}
