import { __i18n } from '@/isomorphic/i18n';
import { ILarkIconName } from '@/components/LarkIcon';
import { MonitorAction } from '@/isomorphic/constant/monitor';
import { WordMarkOptionTypeEnum } from '@/core/configManager/wordMark';

export interface ToolbarItem {
  type: WordMarkOptionTypeEnum;
  name: string;
  icon: ILarkIconName;
  id: string;
  desc: string;
  monitor?: MonitorAction;
}

export const toolbars: ToolbarItem[] = [
  {
    id: WordMarkOptionTypeEnum.clipping,
    type: WordMarkOptionTypeEnum.clipping,
    name: __i18n('剪藏'),
    icon: 'clipping',
    desc: __i18n('将划词内容剪藏到语雀'),
    monitor: MonitorAction.wordMarkClip,
  },
  {
    id: WordMarkOptionTypeEnum.translate,
    type: WordMarkOptionTypeEnum.translate,
    name: __i18n('翻译'),
    icon: 'translate',
    desc: __i18n('对划词内容中英文互译'),
    monitor: MonitorAction.wordMarkTranslate,
  },
];
