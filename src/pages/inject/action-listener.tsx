import { ContentScriptEvents } from '@/isomorphic/event/contentScript';
import { WordMarkMessageActions } from '@/isomorphic/event/wordMark';
import { AccountLayoutMessageActions } from '@/isomorphic/event/accountLayout';
import { App } from './content-scripts';
import { LevitateBallMessageActions } from '@/isomorphic/event/levitateBall';

type MessageSender = chrome.runtime.MessageSender;

type SendResponse = (response: any) => void;

export interface RequestMessage<T> {
  action: ContentScriptEvents;
  data: T;
}

export const initContentScriptActionListener = (context: App) => {
  chrome.runtime.onMessage.addListener(
    (request: RequestMessage<any>, _sender: MessageSender, sendResponse: SendResponse) => {
      switch (request.action) {
        case ContentScriptEvents.WordMarkConfigChange: {
          context.sendMessageToWordMark(WordMarkMessageActions.wordMarkConfigUpdate, request.data);
          sendResponse(true);
          break;
        }
        case ContentScriptEvents.LevitateConfigChange: {
          context.sendMessageToLevitateBall(LevitateBallMessageActions.levitateBallConfigUpdate, request.data);
          sendResponse(true);
          break;
        }
        case ContentScriptEvents.ForceUpgradeVersion: {
          context.sendMessageToAccountLayout(AccountLayoutMessageActions.ForceUpdate, {
            html: request.data?.html,
          });
          sendResponse(true);
          break;
        }
        case ContentScriptEvents.LoginOut: {
          context.sendMessageToAccountLayout(AccountLayoutMessageActions.LoginOut);
          sendResponse(true);
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
