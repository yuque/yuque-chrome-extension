import {
  IAssistant,
  IListenerRemover,
  ISideContentProvider,
  ISidebarContextData,
} from './declare';

interface ISuperSidebarListener {
  onActivateAssistantChanged?(
    assistant: IAssistant<ISideContentProvider>,
  ): void;

  onAssistantsChanged?(): void;

  onManifestsChanged?(): void;
}

class SuperSidebarContainer {
  private _listeners: ISuperSidebarListener[] = [];
  /**
   * 侧边栏的小助手
   * @private
   */
  private _assistants: IAssistant<ISideContentProvider>[] = [];

  /**
   *  当前激活的小助手
   * @private
   */
  private _currentAssistant?: IAssistant<ISideContentProvider>;

  private _contextData?: ISidebarContextData;

  private _initializedAssistants: IAssistant[] = [];

  get assistants() {
    return this._assistants;
  }

  get rightBarAssistants() {
    return this.assistants.filter(x => {
      return this._contextData;
    });
  }

  get currentAssistant() {
    return this._currentAssistant;
  }

  get first() {
    return this.rightBarAssistants?.[0];
  }

  initCurrentAssistant() {
    if (this._assistants.length === 0) {
      return;
    }
    this.switchAssistant(this.first?.id || -1);
  }

  updateContext(contextData: ISidebarContextData) {
    this._contextData = contextData;

    const assistant = this._currentAssistant;
    if (!assistant) {
      return;
    }

    if (assistant.provider?.isEnable?.({ ...contextData })) {
      this.switchAssistant(assistant.id);
    }
  }

  protected notifyListener(invoker: (listener: ISuperSidebarListener) => void) {
    this._listeners.forEach(invoker);
  }

  public getAssistantById<T extends IAssistant<ISideContentProvider>>(
    assistantId: number,
  ): T | undefined {
    return this._assistants.find(assistant => assistant.id === assistantId) as
      | T
      | undefined;
  }

  private setCurrentAssistant(assistant: IAssistant<ISideContentProvider>) {
    if (this._currentAssistant === assistant) {
      return;
    }
    this._currentAssistant = assistant;

    this.notifyListener(listener =>
      listener.onActivateAssistantChanged?.(assistant),
    );
  }

  switchAssistant(assistantId: number) {
    if (!this._contextData) {
      return;
    }

    const assistant = this.getAssistantById(assistantId);

    if (!assistant) {
      return;
    }
    this.setCurrentAssistant(assistant);

    if (!assistant.provider?.isEnable?.({ ...this._contextData })) {
      return;
    }

    if (this._initializedAssistants.indexOf(assistant) > -1) {
      assistant.provider?.onContextDataChanged?.({ ...this._contextData });
      return;
    }

    assistant.provider?.initialize({ ...this._contextData });
    this._initializedAssistants.push(assistant);
  }

  removeAssistant(assistantId: number, destroy?: boolean) {
    const assistant = this.getAssistantById(assistantId);
    if (!assistant) {
      return;
    }

    if (destroy) {
      // 彻底销毁
      const index = this._assistants.indexOf(assistant);
      if (index !== -1) {
        this._assistants.splice(index, 1);
        assistant.provider?.destroy?.();
      }
    }

    this._assistants = this._assistants.filter(item => {
      return item.id !== assistantId;
    });

    if (this.currentAssistant === assistant) {
      if (this.first) {
        this.switchAssistant(this.first.id);
      }
    }

    this.notifyListener(listener => listener.onAssistantsChanged?.());
    this.notifyListener(listener => listener.onManifestsChanged?.());
  }

  addListener(listener: ISuperSidebarListener): IListenerRemover {
    this._listeners.push(listener);
    return () => this.removeListener(listener);
  }

  removeListener(listener: ISuperSidebarListener) {
    this._listeners = this._listeners.filter(item => item !== listener);
  }

  addAssistant(assistant: IAssistant) {
    this._assistants.push(assistant);
    this.notifyListener(listener => listener.onAssistantsChanged?.());
    this.notifyListener(listener => listener.onManifestsChanged?.());
  }
}

export const superSidebar = new SuperSidebarContainer();
