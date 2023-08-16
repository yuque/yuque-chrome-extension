import EventEmitter3 from 'eventemitter3';

export type IEventListener = EventEmitter3.EventListener<any, any>;

export type IEventListenerRemover = () => void;

class EventManager extends EventEmitter3 {
  listen(
    eventName: string,
    listener: IEventListener,
    once?: boolean,
  ): IEventListenerRemover {
    if (once) {
      this.once(eventName, listener);
    } else {
      this.on(eventName, listener);
    }

    return () => {
      this.remove(eventName, listener);
    };
  }

  listenOnce(
    eventName: string,
    listener: IEventListener,
  ): IEventListenerRemover {
    return this.listen(eventName, listener, true);
  }

  remove(eventName: string, listener?: IEventListener) {
    this.off(eventName, listener);
  }

  notify(eventName: string, ...params: any) {
    this.emit(eventName, ...params);
  }
}

const eventManager = new EventManager();

export default eventManager;
