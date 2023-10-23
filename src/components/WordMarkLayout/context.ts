import { createContext } from 'react';
import { IWordMarkConfig } from '@/isomorphic/word-mark';

export interface IWordMarkContext extends IWordMarkConfig {}
export const WordMarkContext = createContext<IWordMarkContext>({} as IWordMarkContext);