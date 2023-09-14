export enum SandBoxMessageType {
  getSelectedHtml = 'getSelectedHtml',

  initSandbox = 'initSandbox',

  startOcr = 'startOcr',
}

export const SandBoxMessageKey = 'sandbox';

export enum ClippingTypeEnum {
  // 剪藏选取的内容
  area = 'area',

  // 剪藏网址
  website = 'website',
}
