export enum OperateTabEnum {
  screenShot = 'screenShot',
  getCurrent = 'getCurrent',
  create = 'create',
  getDocument = 'getDocument',
  showMessage = 'showMessage',
}

export interface IOperateTabData {
  type: OperateTabEnum;
  url?: string;
  data?: any;
}
