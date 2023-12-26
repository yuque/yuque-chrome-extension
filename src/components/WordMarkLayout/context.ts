import { createContext } from 'react';
import { IWordMarkConfig, WordMarkOptionTypeEnum } from '@/core/configManager/wordMark';

export type IWordMarkContext = IWordMarkConfig & {
  filterInnerPinList: Array<WordMarkOptionTypeEnum>;
  filterToolbars: Array<WordMarkOptionTypeEnum>;
  destroyWordMark: () => void;
};
export const WordMarkContext = createContext<IWordMarkContext>({} as IWordMarkContext);
