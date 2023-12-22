export enum OperateClipEnum {
  selectArea = 'selectArea',
  screenOcr = 'screenOcr',
  clipPage = 'clipPage',
}

export interface IOperateClipData {
  type: OperateClipEnum;
  isRunningHostPage: boolean;
}
