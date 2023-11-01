import { createContext } from 'react';
import { IWordMarkConfig } from '@/isomorphic/constant/wordMark';
import { WordMarkOptionTypeEnum } from '@/isomorphic/constants';

export type IWordMarkContext = IWordMarkConfig & {
  filterInnerPinList: Array<WordMarkOptionTypeEnum>;
  filterToolbars: Array<WordMarkOptionTypeEnum>;
};
export const WordMarkContext = createContext<IWordMarkContext>(
  {} as IWordMarkContext,
);
