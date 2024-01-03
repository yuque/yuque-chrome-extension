import { getMsgId } from '@/isomorphic/util';
import Env from '@/isomorphic/env';
import { ExtensionMessageListener } from './interface';

class ExtensionMessage {
  static async sendToBackground(type: string, data: any, id?: string) {
    if (Env.isBackground) {
      throw new Error('sendToBackground not allowed in background');
    }
    const params = {
      type,
      data,
      id: id || getMsgId({ type }),
    };
    chrome.runtime.sendMessage(params);
  }

  static addListener(
    type: string | ExtensionMessageListener,
    fn: (data: any, id: string, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => void,
  ) {
    const listener = (request: any, sender: chrome.runtime.MessageSender, sendResponse: (rest: any) => void) => {
      if (request.type === type) {
        fn(request.data, request.id, sender, sendResponse);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }

  static async sendToContent(tabId: number, type: string, data: any, id?: string) {
    if (!Env.isBackground) {
      throw new Error('sendToContent only allowed in background');
    }
    const params = {
      type,
      data,
      id: id || getMsgId({ type }),
    };
    chrome.tabs.sendMessage(tabId, params);
  }
}

export default ExtensionMessage;
