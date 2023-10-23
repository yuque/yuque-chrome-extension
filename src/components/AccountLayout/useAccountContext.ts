import { useContext } from 'react';
import { AccountContext } from './context';

export function useAccountContext() {
  const context = useContext(AccountContext);
  return context;
}
