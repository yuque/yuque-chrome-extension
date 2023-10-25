export enum OperateStorageEnum {
  update = 'update',
  remove = 'remove',
  get = 'get',
}

export interface IOperateStorageData {
  type: OperateStorageEnum;
  data?: string;
  key: string;
}
