import { useContext } from 'react';
import { WordMarkContext } from './context';

export function useWordMarkContext() {
  const context = useContext(WordMarkContext);
  return context;
}
