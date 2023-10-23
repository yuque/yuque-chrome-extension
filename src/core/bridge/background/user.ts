import { BackgroundEvents } from '@/isomorphic/background';
import { OperateUserEnum } from '@/isomorphic/background/user';
import { IUser } from '@/isomorphic/interface';
import { ICallBridgeImpl } from './index';

export function createUserBridge(impl: ICallBridgeImpl) {
  return {
    user: {
      async login(): Promise<IUser | null> {
        return new Promise(resolve => {
          impl(
            BackgroundEvents.OperateUser,
            { type: OperateUserEnum.login },
            res => {
              resolve(res || null);
            },
          );
        });
      },
    },
  };
}
