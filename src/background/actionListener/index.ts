import { BACKGROUND_EVENTS } from '@/events';
import Chrome from '@/background/core/chrome';
import { BackgroundEvents } from '@/isomorphic/background';
import { createWindowActionListener } from './window';
import { createStorageActionListener } from './storage';
import { createUserActionListener } from './user';
import { createClipActionListener } from './clip';
import { createTabActionListener } from './tab';
import { createSidePanelActionListener } from './sidePanel';
import { createRequestActionListener } from './request';
import { createWordMarkConfigActionListener } from './wordMarkConfig';

type MessageSender = chrome.runtime.MessageSender;

type SendResponse = (response: any) => void;

export interface RequestMessage<T> {
  action: keyof typeof BACKGROUND_EVENTS | BackgroundEvents;
  data: T;
}

export const initBackGroundActionListener = () => {
  Chrome.runtime.onMessage.addListener(
    (
      request: RequestMessage<any>,
      _sender: MessageSender,
      sendResponse: SendResponse,
    ) => {
      switch (request.action) {
        case BackgroundEvents.OperateWindow: {
          createWindowActionListener(request, sendResponse);
          break;
        }
        case BackgroundEvents.OperateUser: {
          createUserActionListener(request, sendResponse);
          break;
        }
        case BackgroundEvents.OperateStorage: {
          createStorageActionListener(request, sendResponse);
          break;
        }
        case BackgroundEvents.OperateClip: {
          createClipActionListener(request, sendResponse);
          break;
        }
        case BackgroundEvents.OperateTab: {
          createTabActionListener(request, sendResponse);
          break;
        }
        case BackgroundEvents.OperateSidePanel: {
          createSidePanelActionListener(request, sendResponse);
          break;
        }
        case BackgroundEvents.OperateRequest: {
          createRequestActionListener(request, sendResponse);
          break;
        }
        case BackgroundEvents.OperateWordMarkConfig: {
          createWordMarkConfigActionListener(request, sendResponse);
          break;
        }
        default:
          sendResponse(true);
          break;
      }
      return true;
    },
  );
};
