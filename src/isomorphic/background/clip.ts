export enum OperateClipEnum {
  selectArea = 'selectArea',
  screenOcr = 'screenOcr',
  clipPage = 'clipPage',
  getImage = 'getImage',
}

export interface IOperateClipData {
  type: OperateClipEnum;
  isRunningHostPage: boolean;
}
