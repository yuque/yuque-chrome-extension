import { BACKGROUND_EVENTS } from '@/events';
import {
  getWordMarkConfig,
  updateWordMarkConfig,
} from '@/core/account';
import Chrome from '@/core/chrome';
import { noteProxy, NoteCreateParams } from '@/core/proxy/note';
import { wordMarkProxy } from '@/core/proxy/word-mark';
import { docProxy, ICreateDocParams } from '@/core/proxy/doc';

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
          getWordMarkConfig().then(res => {
            sendResponse(res);
          });
          break;
        }
        case BACKGROUND_EVENTS.UPDATE_WORD_MARK_CONFIG: {
          const { key, value } = request.data;
          updateWordMarkConfig(key, value).then(res => {
            sendResponse(res);
          });
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
          Chrome.tabs.create({ url: Chrome.runtime.getURL('/setting.html') });
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
