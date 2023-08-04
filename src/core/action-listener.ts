import { GLOBAL_EVENTS } from '@/events';
import Chrome from './chrome';

type MessageSender = chrome.runtime.MessageSender;

type SendResponse = (response: boolean) => void;

export interface RequestMessage {
  action: keyof typeof GLOBAL_EVENTS;
  HTMLs?: string[];
}

export const ActionListener: {
  currentType: string | null;
  HTMLs: string[];
  listener: ((request: RequestMessage) => void)[];
  addListener: (callback: (request: RequestMessage) => void) => () => void;
  getSelectHTMLs: () => string[];
} = {
  currentType: null,
  listener: [],
  HTMLs: [],
  getSelectHTMLs() {
    const HTMLs = this.HTMLs;
    this.HTMLs = [];
    return HTMLs;
  },
  addListener(callback: (request: RequestMessage) => void) {
    this.listener.push(callback);
    return () => {
      this.listener = this.listener.filter(item => item !== callback);
    };
  },
};

const onReceiveMessage = async (
  request: RequestMessage,
  _sender: MessageSender,
  sendResponse: SendResponse,
) => {
  sendResponse(true);
  const currentTab = await Chrome.getCurrentTab();
  // 判断是否处于激活态，如果不是激活态不进行后续处理
  if (!currentTab?.active) {
    return;
  }
  ActionListener.listener.forEach(listener => listener(request));
  if (request.action === GLOBAL_EVENTS.GET_SELECTED_TEXT) {
    ActionListener.currentType = 'selection';
    ActionListener.HTMLs = request.HTMLs || [];
  }
};

Chrome.runtime.onMessage.addListener(onReceiveMessage);
window.addEventListener('beforeunload', () => {
  Chrome.runtime.onMessage.removeListener(onReceiveMessage);
});
