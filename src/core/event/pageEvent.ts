import { PageEventTypes } from '@/isomorphic/event/pageEvent';
import ExtensionMessage from '@/isomorphic/extensionMessage/extensionMessage';
import { ExtensionMessageListener } from '@/isomorphic/extensionMessage/interface';

/**
 * background 监听后台页面的事件
 */
class PageEvent {
  private extensionListener?: any = null;
  private listenerMap: { [key: string]: Array<(params: Record<string, any>) => void> } = {};

  private initListener() {
    if (this.extensionListener) {
      return;
    }
    this.extensionListener = (data: { type: string; data?: Record<string, any> }) => {
      if (this.listenerMap[data.type]?.length) {
        this.listenerMap[data.type]?.forEach(fn => {
          fn(data.data || {});
        });
      }
    };
    ExtensionMessage.addListener(ExtensionMessageListener.pageEvent, this.extensionListener);
  }

  addListener(type: PageEventTypes, fn: (params: Record<string, any>) => void) {
    this.initListener();
    if (!this.listenerMap[type]) {
      this.listenerMap[type] = [];
    }
    this.listenerMap[type].push(fn);
    return () => {
      const index = this.listenerMap[type].indexOf(fn);
      this.listenerMap[type].splice(index, 1);
    };
  }
}

export const pageEvent = new PageEvent();
