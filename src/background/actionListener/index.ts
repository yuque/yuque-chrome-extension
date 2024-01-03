import chromeExtension from '@/background/core/chromeExtension';
import { BackgroundEvents } from '@/isomorphic/background';
import { createStorageActionListener } from './storage';
import { createUserActionListener } from './user';
import { createClipActionListener } from './clip';
import { createTabActionListener } from './tab';
import { createSidePanelActionListener } from './sidePanel';
import HttpClient from '../core/httpClient';

type SendResponse = (response: any) => void;

export interface RequestMessage<T> {
  action: BackgroundEvents;
  data: T;
}

export const initBackGroundActionListener = (httpClient: HttpClient) => {
  chromeExtension.runtime.onMessage.addListener(
    (request: RequestMessage<any>, _sender: chrome.runtime.MessageSender, sendResponse: SendResponse) => {
      switch (request.action) {
        case BackgroundEvents.OperateUser: {
          createUserActionListener(request, sendResponse, _sender, httpClient);
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
        default: {
          break;
        }
      }
      return true;
    },
  );
};
