import { WordMarkOptionTypeEnum } from '@/isomorphic/constants';
import { __i18n } from '@/isomorphic/i18n';
import Clipping from '@/assets/svg/clipping.svg';
import Translate from '@/assets/svg/translate.svg';

export interface ToolbarItem {
  type: WordMarkOptionTypeEnum;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  id: string;
}

export const toolbars: ToolbarItem[] = [
  {
    id: WordMarkOptionTypeEnum.clipping,
    type: WordMarkOptionTypeEnum.clipping,
    name: __i18n('剪藏'),
    icon: Clipping,
  },
  {
    id: WordMarkOptionTypeEnum.translate,
    type: WordMarkOptionTypeEnum.translate,
    name: __i18n('翻译'),
    icon: Translate,
  },
];
