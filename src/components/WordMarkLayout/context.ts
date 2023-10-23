import { createContext } from 'react';
import { IWordMarkConfig } from '@/isomorphic/constant/wordMark';

export interface IWordMarkContext extends IWordMarkConfig {}
export const WordMarkContext = createContext<IWordMarkContext>({} as IWordMarkContext);
