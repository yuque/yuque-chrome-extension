import { IWordMarkConfig } from '@/core/account';
import { createContext } from 'react';
export interface IWordMarkContext extends IWordMarkConfig {
  destroyWordMark: () => void;
}
export const WordMarkContext = createContext<IWordMarkContext | null>(null);
