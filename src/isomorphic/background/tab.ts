export enum OperateTabEnum {
  screenShot = 'screenShot',
  getCurrent = 'getCurrent',
  create = 'create',
}

export interface IOperateTabData {
  type: OperateTabEnum;
  url?: string;
}
