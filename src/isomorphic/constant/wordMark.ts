import { ISavePosition } from '@/core/bridge/background/request/mine';
import { WordMarkOptionTypeEnum } from '../constants';

export enum WordMarkConfigKey {
  // 是否开启
  enable = 'enable',

  // 剪藏默认存储地址
  defaultSavePosition = 'defaultSavePosition',

  // 划词置顶的操作
  innerPinList = 'innerPinList',

  // 禁用页面的 url
  disableUrl = 'disableUrl',

  // 剪藏时唤起面板
  evokePanelWhenClip = 'evokePanelWhenClip',

  // 剪藏面板的排序规则
  toolbars = 'toolbars',

  // 换次面板快捷键
  evokeWordMarkShortKey = 'evokeWordMarkShortKey',
}

export interface IWordMarkConfig {
  [WordMarkConfigKey.enable]: boolean;
  [WordMarkConfigKey.defaultSavePosition]: ISavePosition;
  [WordMarkConfigKey.innerPinList]: Array<WordMarkOptionTypeEnum>;
  [WordMarkConfigKey.disableUrl]: Array<string>;
  [WordMarkConfigKey.evokePanelWhenClip]: boolean;
  [WordMarkConfigKey.toolbars]: Array<WordMarkOptionTypeEnum>;
  [WordMarkConfigKey.evokeWordMarkShortKey]: string;
}

export const defaultWordMarkConfig: IWordMarkConfig = {
  enable: false,
  defaultSavePosition: {
    type: 'Note',
    id: 0,
    name: '小记',
  },
  innerPinList: [
    WordMarkOptionTypeEnum.clipping,
    WordMarkOptionTypeEnum.translate,
  ],
  disableUrl: [],
  evokePanelWhenClip: false,
  toolbars: [WordMarkOptionTypeEnum.clipping, WordMarkOptionTypeEnum.translate],
  evokeWordMarkShortKey: '',
};

