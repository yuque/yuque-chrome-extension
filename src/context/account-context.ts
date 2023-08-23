import { IUser } from '@/core/account';
import { createContext } from 'react';


export interface IAccountContext {
  user: IUser;
  onLogout: () => void;
}

export const AccountContext = createContext<IAccountContext | null>(null);
