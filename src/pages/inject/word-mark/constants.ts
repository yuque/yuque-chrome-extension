import { WordMarkOptionTypeEnum } from '@/isomorphic/constants';
import Clipping from '@/assets/svg/clipping.svg';
import Translate from '@/assets/svg/translate.svg';

export interface ToolbarItem {
  type: WordMarkOptionTypeEnum;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export const toolbars: ToolbarItem[] = [
  {
    type: WordMarkOptionTypeEnum.translate,
    name: '翻译',
    icon: Translate,
  },
  {
    type: WordMarkOptionTypeEnum.clipping,
    name: '剪藏',
    icon: Clipping,
  },
];
