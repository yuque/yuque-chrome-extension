import { BACKGROUND_EVENTS, PAGE_EVENTS } from '@/events';
import Chrome from '@/core/chrome';
import { noteProxy, NoteCreateParams } from '@/core/proxy/note';
import { wordMarkProxy } from '@/core/proxy/word-mark';
import { docProxy, ICreateDocParams } from '@/core/proxy/doc';
import { wordMarkConfigManager } from '@/core/manager/word-mark-config';
import { wordMarkSettingUrl } from '@/isomorphic/word-mark';
import { mineProxy } from '@/core/proxy/mine';
import { login } from '@/core/login-helper';
import { tagProxy } from '@/core/proxy/tag';
import { clearCurrentAccount, getCurrentAccount } from '@/core/account';

type MessageSender = chrome.runtime.MessageSender;

type SendResponse = (response: any) => void;

export interface RequestMessage {
  action: keyof typeof BACKGROUND_EVENTS;
  data: { [key: string]: any };
}

export const initBackGroundActionListener = () => {
  Chrome.runtime.onMessage.addListener(
    (
      request: RequestMessage,
      _sender: MessageSender,
      sendResponse: SendResponse,
    ) => {
      switch (request.action) {
        case BACKGROUND_EVENTS.GET_WORD_MARK_CONFIG: {
          wordMarkConfigManager.get().then(sendResponse);
          break;
        }
        case BACKGROUND_EVENTS.UPDATE_WORD_MARK_CONFIG: {
          const { key, value, option = {} } = request.data;
          wordMarkConfigManager.update(key, value, option).then(sendResponse);
          break;
        }
        case BACKGROUND_EVENTS.WORD_MARK_EXECUTE_COMMAND: {
          const { selectText } = request.data;
          wordMarkProxy.translate([ selectText ]).then(res => {
            sendResponse(res.data);
          });
          break;
        }
        case BACKGROUND_EVENTS.SAVE_TO_NOTE: {
          const data = request.data as NoteCreateParams;
          noteProxy
            .create({
              ...data,
            })
            .then(res => {
              sendResponse(res);
            });
          break;
        }
        case BACKGROUND_EVENTS.SAVE_TO_BOOK: {
          const data = request.data as ICreateDocParams;
          docProxy
            .create({
              ...data,
            })
            .then(res => {
              sendResponse(res);
            });
          break;
        }
        case BACKGROUND_EVENTS.OPEN_SETTING_PAGE: {
          Chrome.tabs.create({ url: wordMarkSettingUrl });
          sendResponse(true);
          break;
        }
        case BACKGROUND_EVENTS.GET_CURRENT_ACCOUNT_INFO: {
          getCurrentAccount().then(res => sendResponse(res));
          break;
        }
        case BACKGROUND_EVENTS.GET_MINE_BOOK: {
          mineProxy.getBooks().then(res => {
            sendResponse(res);
          });
          break;
        }
        case BACKGROUND_EVENTS.GET_MINE_TAG: {
          tagProxy.index().then(res => {
            sendResponse(res);
          });
          break;
        }
        case BACKGROUND_EVENTS.CREATE_TAG: {
          const data = request.data as { name: string };
          tagProxy.create(data).then(res => sendResponse(res));
          break;
        }
        case BACKGROUND_EVENTS.REQUEST_LOGIN: {
          login().then(res => {
            Chrome.tabs.query({ active: true }, tabs => {
              Chrome.tabs.sendMessage(tabs[0].id, {
                action: PAGE_EVENTS.LOGIN_SUCCESS,
                data: res,
              });
            });
          });
          sendResponse(true);
          break;
        }
        case BACKGROUND_EVENTS.REQUEST_LOGOUT: {
          clearCurrentAccount().then(() => {
            sendResponse(true);
          });
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
