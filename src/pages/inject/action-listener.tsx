import React from 'react';
import { message } from 'antd';
import Chrome from '@/background/core/chrome';
import {
  ContentScriptEvents,
  ContentScriptMessageKey,
  ContentScriptMessageActions,
  IShowMessageData,
} from '@/isomorphic/event/contentScript';
import { ClipAssistantMessageActions } from '@/isomorphic/event/clipAssistant';
import { WordMarkMessageActions } from '@/isomorphic/event/wordMark';
import { AccountLayoutMessageActions } from '@/isomorphic/event/accountLayout';
import { App } from './content-scripts';
import { showScreenShot } from './ScreenShot';
import { showSelectArea } from './AreaSelector';
import { LevitateBallMessageActions } from '@/isomorphic/event/levitateBall';

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
          const { isRunningInjectPage = true } = request.data || {};
          context.isOperateSelecting = true;
          isRunningInjectPage && context.hiddenSidePanel();
          new Promise(resolve => {
            showScreenShot({
              dom: context.rootContainer,
              onScreenCancel: () => resolve(null),
              onScreenSuccess: resolve,
            });
          }).then(res => {
            context.isOperateSelecting = false;
            isRunningInjectPage && context.showSidePanel();
            sendResponse(res);
          });
          break;
        }
        case ContentScriptEvents.SelectArea: {
          const { isRunningInjectPage = true } = request.data || {};
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
          isRunningInjectPage && context.hiddenSidePanel();
          new Promise(resolve => {
            showSelectArea({
              dom: context.rootContainer,
              onSelectAreaCancel: () => resolve(''),
              onSelectAreaSuccess: resolve,
            });
          }).then(res => {
            context.isOperateSelecting = false;
            isRunningInjectPage && context.showSidePanel();
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
        case ContentScriptEvents.LevitateConfigChange: {
          context.sendMessageToLevitateBall(
            LevitateBallMessageActions.levitateBallConfigUpdate,
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
        case ContentScriptEvents.GetDocument: {
          sendResponse({
            url: window.location.href,
            html: document.documentElement.outerHTML,
            title: document.title,
          });
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

export const initContentScriptMessageListener = () => {
  window.addEventListener('message', (e: MessageEvent<any>) => {
    const { action, key, data } = e.data || {};
    if (key !== ContentScriptMessageKey) {
      return;
    }
    switch (action) {
      case ContentScriptMessageActions.ShowMessage: {
        const { type, text, link } = (data || {}) as IShowMessageData;
        const content = (
          <span className="yuque-chrome-extension-message">
            <span className="yuque-chrome-extension-message-text">{text}</span>
            {!!link && (
              <a
                target="_blank"
                href={link.href}
                className="yuque-chrome-extension-message-href"
              >
                {link.text}
              </a>
            )}
          </span>
        );
        if (type === 'success') {
          message.success({
            content,
            className: 'yuque-chrome-extension-message-wrapper',
          });
        }
        if (type === 'error') {
          message.error({
            content,
            className: 'yuque-chrome-extension-message-wrapper',
          });
        }
        break;
      }
      default: {
        break;
      }
    }
  });
};
