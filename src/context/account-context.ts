import { createContext } from 'react';
import { IUser } from '@/core/account';

export interface IAccountContext {
  user: IUser;
  onLogout: () => void;
}

export const AccountContext = createContext<IAccountContext | null>(null);
