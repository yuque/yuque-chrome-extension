import { BACKGROUND_EVENTS } from '@/events';
import { getWordMarkPinList, updateWordMarkPinList } from '@/core/account';
import Chrome from '@/core/chrome';
import proxy from '@/core/proxy';

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
        case BACKGROUND_EVENTS.UPDATE_WORD_MARK_PIN: {
          const { pinList = [] } = request.data || {};
          updateWordMarkPinList(pinList).then(() => {
            sendResponse({ result: pinList });
          });
          break;
        }
        case BACKGROUND_EVENTS.GET_WORD_MARK_PIN: {
          getWordMarkPinList().then(res => {
            sendResponse({ result: res });
          });
          break;
        }
        case BACKGROUND_EVENTS.WORD_MARK_EXECUTE_COMMAND: {
          const { selectText } = request.data;
          proxy.wordMark.translate([ selectText ]).then(res => {
            sendResponse(res.data);
          });
          break;
        }
        case BACKGROUND_EVENTS.SAVE_TO_NOTE: {
          const data = request.data;
          proxy.note
            .create({
              ...data,
            })
            .then(res => {
              sendResponse(res);
            });
          break;
        }
      }
      return true;
    },
  );
};
