import { createContext } from 'react';
import { IWordMarkConfig } from '@/isomorphic/constant/wordMark';

export type IWordMarkContext = IWordMarkConfig;
export const WordMarkContext = createContext<IWordMarkContext>({} as IWordMarkContext);
