import Chrome from '@/background/core/chrome';
import { ContentScriptEvents } from '@/isomorphic/contentScript';
import { ClipAssistantMessageActions } from '@/isomorphic/event/clipAssistant';
import { WordMarkMessageActions } from '@/isomorphic/event/wordMark';
import { AccountLayoutMessageActions } from '@/isomorphic/event/accountLayout';
import { App } from './content-scripts';
import { showScreenShot } from './ScreenShot';
import { showSelectArea } from './AreaSelector';

type MessageSender = chrome.runtime.MessageSender;

type SendResponse = (response: any) => void;

export interface RequestMessage<T> {
  action: ContentScriptEvents;
  data: T;
}

export const initContentScriptActionListener = (context: App) => {
  Chrome.runtime.onMessage.addListener(
    (
      request: RequestMessage<any>,
      _sender: MessageSender,
      sendResponse: SendResponse,
    ) => {
      switch (request.action) {
        case ContentScriptEvents.ScreenOcr: {
          if (context.isOperateSelecting) {
            sendResponse(true);
            break;
          }
          if (request.data?.formShortcut) {
            context.sendMessageToClipAssistant(
              ClipAssistantMessageActions.startScreenOcr,
            );
            sendResponse(true);
            break;
          }
          context.isOperateSelecting = true;
          context.hiddenSidePanel();
          new Promise(resolve => {
            showScreenShot({
              dom: context.rootContainer,
              onScreenCancel: () => resolve(null),
              onScreenSuccess: resolve,
            });
          }).then(res => {
            context.isOperateSelecting = false;
            context.showSidePanel();
            sendResponse(res);
          });
          break;
        }
        case ContentScriptEvents.SelectArea: {
          if (context.isOperateSelecting) {
            sendResponse(true);
            break;
          }
          if (request.data?.formShortcut) {
            context.sendMessageToClipAssistant(
              ClipAssistantMessageActions.startSelectArea,
            );
            sendResponse(true);
            break;
          }
          context.isOperateSelecting = true;
          context.hiddenSidePanel();
          new Promise(resolve => {
            showSelectArea({
              dom: context.rootContainer,
              onSelectAreaCancel: () => resolve(''),
              onSelectAreaSuccess: resolve,
            });
          }).then(res => {
            context.isOperateSelecting = false;
            context.showSidePanel();
            sendResponse(res);
          });
          break;
        }
        case ContentScriptEvents.CollectLink: {
          context.showSidePanel().then(() => {
            context.sendMessageToClipAssistant(
              ClipAssistantMessageActions.startCollectLink,
            );
          });
          sendResponse(true);
          break;
        }
        case ContentScriptEvents.ToggleSidePanel: {
          if (typeof request.data?.forceVisible === 'boolean') {
            request.data?.forceVisible
              ? context.showSidePanel()
              : context.hiddenSidePanel();
          } else {
            context.toggleSidePanel();
          }
          sendResponse(true);
          break;
        }
        case ContentScriptEvents.WordMarkConfigChange: {
          context.sendMessageToWordMark(
            WordMarkMessageActions.wordMarkConfigUpdate,
            request.data,
          );
          sendResponse(true);
          break;
        }
        case ContentScriptEvents.AddContentToClipAssistant: {
          context.sendMessageToClipAssistant(
            ClipAssistantMessageActions.addContent,
            request.data,
          );
          context.showSidePanel();
          sendResponse(true);
          break;
        }
        case ContentScriptEvents.ForceUpgradeVersion: {
          context.sendMessageToAccountLayout(
            AccountLayoutMessageActions.ForceUpdate,
            {
              html: request.data?.html,
            },
          );
          sendResponse(true);
          break;
        }
        case ContentScriptEvents.LoginOut: {
          context.sendMessageToAccountLayout(
            AccountLayoutMessageActions.LoginOut,
          );
          sendResponse(true);
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
