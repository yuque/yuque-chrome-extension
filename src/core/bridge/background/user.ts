import { BackgroundEvents } from '@/isomorphic/background';
import { OperateUserEnum } from '@/isomorphic/background/user';
import { IShortcutMap, IUser } from '@/isomorphic/interface';
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
      async getUserShortCut(): Promise<IShortcutMap> {
        return new Promise(resolve => {
          impl(
            BackgroundEvents.OperateUser,
            { type: OperateUserEnum.getUserShortCut },
            res => {
              const map: IShortcutMap = {};
              for (const item of res) {
                map[item.name as keyof IShortcutMap] = item.shortcut;
              }
              resolve(map);
            },
          );
        });
      },
    },
  };
}
