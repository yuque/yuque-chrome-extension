import Chrome from '@/background/core/chromeExtension';
import { BackgroundEvents } from '@/isomorphic/background';
import { createStorageActionListener } from './storage';
import { createUserActionListener } from './user';
import { createClipActionListener } from './clip';
import { createTabActionListener } from './tab';
import { createSidePanelActionListener } from './sidePanel';
import { createRequestActionListener } from './request';
import { createManagerConfigActionListener } from './configManager';

type SendResponse = (response: any) => void;

export interface RequestMessage<T> {
  action: BackgroundEvents;
  data: T;
}

export const initBackGroundActionListener = () => {
  Chrome.runtime.onMessage.addListener(
    (request: RequestMessage<any>, _sender: chrome.runtime.MessageSender, sendResponse: SendResponse) => {
      switch (request.action) {
        case BackgroundEvents.OperateUser: {
          createUserActionListener(request, sendResponse, _sender);
          break;
        }
        case BackgroundEvents.OperateStorage: {
          createStorageActionListener(request, sendResponse, _sender);
          break;
        }
        case BackgroundEvents.OperateClip: {
          createClipActionListener(request, sendResponse, _sender);
          break;
        }
        case BackgroundEvents.OperateTab: {
          createTabActionListener(request, sendResponse, _sender);
          break;
        }
        case BackgroundEvents.OperateSidePanel: {
          createSidePanelActionListener(request, sendResponse, _sender);
          break;
        }
        case BackgroundEvents.OperateRequest: {
          createRequestActionListener(request, sendResponse, _sender);
          break;
        }
        case BackgroundEvents.OperateManagerConfig: {
          createManagerConfigActionListener(request, sendResponse, _sender);
          break;
        }
        default: {
          break;
        }
      }
      return true;
    },
  );
};
