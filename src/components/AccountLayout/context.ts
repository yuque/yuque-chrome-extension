import { IUser } from '@/isomorphic/interface';
import { createContext } from 'react';

export interface IAccountContext {
  user: IUser;
  onLogout: () => void;
}

export const AccountContext = createContext<IAccountContext>({
  user: {} as IUser,
  onLogout: () => {
    //
  },
});
