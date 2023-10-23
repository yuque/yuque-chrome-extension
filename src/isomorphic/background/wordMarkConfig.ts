import { WordMarkConfigKey } from '../word-mark';

export enum OperateWordConfigMarkEnum {
  get = 'get',
  update = 'update',
}

export interface IWordMarkConfigOption {
  notice?: boolean;
}

export interface IOperateWordMarkConfigData {
  type: OperateWordConfigMarkEnum;
  key: WordMarkConfigKey;
  value?: any;
  option?: IWordMarkConfigOption;
}
