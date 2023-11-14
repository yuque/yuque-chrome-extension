export enum OperateTabEnum {
  screenShot = 'screenShot',
  getCurrent = 'getCurrent',
  create = 'create',
  getDocument = 'getDocument',
}

export interface IOperateTabData {
  type: OperateTabEnum;
  url?: string;
}
