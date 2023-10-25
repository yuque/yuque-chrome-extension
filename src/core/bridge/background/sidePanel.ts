import { BackgroundEvents } from '@/isomorphic/background';
import { OperateSidePanelEnum } from '@/isomorphic/background/sidePanel';
import { ICallBridgeImpl } from './index';

export function createSidePanelBridge(impl: ICallBridgeImpl) {
  return {
    sidePanel: {
      async close() {
        return new Promise(resolve => {
          impl(
            BackgroundEvents.OperateSidePanel,
            { type: OperateSidePanelEnum.close },
            res => {
              resolve(res);
            },
          );
        });
      },

      async open() {
        return new Promise(resolve => {
          impl(
            BackgroundEvents.OperateSidePanel,
            { type: OperateSidePanelEnum.open },
            res => {
              resolve(res);
            },
          );
        });
      },
    },
  };
}
