import { ISavePosition } from '@/core/bridge/background/request/mine';
import { WordMarkOptionTypeEnum } from '../constants';

export type IWordMarkConfig = {
  // 是否开启
  enable: boolean;

  // 剪藏默认存储地址
  defaultSavePosition: ISavePosition;

  // 划词置顶的操作
  innerPinList: Array<WordMarkOptionTypeEnum>;

  // 禁用页面的 url
  disableUrl: Array<string>;

  // 剪藏时唤起面板
  evokePanelWhenClip: boolean;

  // 剪藏面板的排序规则
  toolbars: Array<WordMarkOptionTypeEnum>;

  // 换次面板快捷键
  evokeWordMarkShortKey: string;

  // 用户关闭的划词的某个功能
  disableFunction: Array<WordMarkOptionTypeEnum>;
};

export type WordMarkConfigKey = keyof IWordMarkConfig;

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
  disableFunction: [],
};
