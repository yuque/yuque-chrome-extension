export enum OperateClipEnum {
  selectArea = 'selectArea',
  screenOcr = 'screenOcr',
}

export interface IOperateClipData {
  type: OperateClipEnum;
}
