import { initI18N } from '@/isomorphic/i18n';
import { ClipAssistantMessageActions } from '@/isomorphic/event/clipAssistant';
import {
  InjectScriptRequestKey,
  InjectScriptResponseKey,
  MessageEventRequestData,
  MessageEventResponseData,
} from '@/isomorphic/injectScript';
import { getMsgId } from '@/isomorphic/util';
import { parseDom } from '@/core/parseDom';
import { ContentScriptAppRef, ShowMessageConfig, createContentScriptApp } from './app';
import { showSelectArea } from './AreaSelector';
import { showScreenShot } from './ScreenShot';

export class App {
  /**
   * 插件注入页面的 dom 的父节点
   */
  private _rootContainer: HTMLDivElement | null = null;

  /**
   * shadowRoot 节点
   */
  private _shadowRoot: ShadowRoot | null = null;

  private contentScriptAppRef: React.RefObject<ContentScriptAppRef> | null = null;

  /**
   * 是否在操作选取，如 ocr 截屏、dom 选取
   */
  public isOperateSelecting = false;

  public removeWordMark: VoidCallback = () => {
    //
  };

  constructor() {
    this.initRoot();
    // 注入 inject-content-script.js
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject-content-script.js');
    document.body.append(script);
    script.onload = () => {
      script.parentNode?.removeChild(script);
    };
  }

  get rootContainer(): HTMLDivElement {
    return this._rootContainer as HTMLDivElement;
  }

  get shadowRoot(): ShadowRoot {
    return this._shadowRoot as ShadowRoot;
  }

  private initRoot() {
    const div = document.createElement('div');
    div.id = 'yuque-extension-root-container';
    div.classList.add('yuque-extension-root-container-class');
    const css = chrome.runtime.getURL('content-scripts.css');
    fetch(css)
      .then(response => response.text())
      .then(cssContent => {
        const style = document.createElement('style');
        style.textContent = cssContent;
        // 获取影子节点
        const shadowRoot = div.attachShadow({ mode: 'open' });
        this._shadowRoot = shadowRoot;
        // 创建根节点，所有注入页面的内容都必须挂到这个根节点下
        const root = document.createElement('div');
        this._rootContainer = root;
        // 将 style、root 加入到影子节点中
        shadowRoot.appendChild(style);
        shadowRoot.appendChild(root);
        this._shadowRoot = shadowRoot;
        document.body.appendChild(div);
        const { ref } = createContentScriptApp();
        this.contentScriptAppRef = ref;
      });
  }

  async toggleSidePanel(visible?: boolean) {
    this.contentScriptAppRef?.current?.toggleSidePanel(visible);
  }

  async senMessageToPage(params: MessageEventRequestData['data']) {
    return new Promise((resolve, rejected) => {
      const requestId = getMsgId({ type: `${params.serviceName}-${params.serviceMethod}` });
      const onMessage = (e: MessageEvent<MessageEventResponseData>) => {
        if (e.data?.key !== InjectScriptResponseKey) {
          return;
        }
        if (e.data?.requestId !== requestId) {
          return;
        }
        // 发生了错误
        if (e.data.data.error) {
          rejected(new Error(e.data.data.error));
        } else {
          resolve(e.data.data.result);
        }
        window.removeEventListener('message', onMessage);
      };

      // 监听消息
      window.addEventListener('message', onMessage);

      window.postMessage(
        {
          key: InjectScriptRequestKey,
          requestId,
          data: {
            serviceName: params.serviceName,
            serviceMethod: params.serviceMethod,
            params: params.params,
          },
        },
        '*',
      );

      setTimeout(() => {
        // 30s 还没有返回中断请求
        window.removeEventListener('message', onMessage);
        rejected(new Error('request timeout'));
      }, 30000);
    });
  }

  async clipPage() {
    const result = await this.parsePage();
    this.toggleSidePanel(true);
    this.addContentToClipAssistant(result);
  }

  async parsePage() {
    const enableDocumentCopy = await this.senMessageToPage({
      serviceName: 'CommonService',
      serviceMethod: 'enableDocumentCopy',
    });
    if (!enableDocumentCopy) {
      this.showMessage({ type: 'error', text: __i18n('当前页面已开启防复制，不支持剪藏') });
      return;
    }
    const result = await parseDom.parsePage();
    return result;
  }

  async clipSelectArea(params?: { isRunningHostPage: boolean; formShortcut: boolean }) {
    if (this.isOperateSelecting) {
      return;
    }
    const enableDocumentCopy = await this.senMessageToPage({
      serviceName: 'CommonService',
      serviceMethod: 'enableDocumentCopy',
    });
    if (!enableDocumentCopy) {
      this.showMessage({ type: 'error', text: __i18n('当前页面已开启防复制，不支持剪藏') });
      return;
    }
    const { isRunningHostPage = true, formShortcut = false } = params || {};
    this.isOperateSelecting = true;
    isRunningHostPage && this.toggleSidePanel(false);
    const result: string = await new Promise(resolve => {
      showSelectArea({
        dom: this.rootContainer,
        onSelectAreaCancel: () => resolve(''),
        onSelectAreaSuccess: resolve,
      });
    });
    this.isOperateSelecting = false;
    isRunningHostPage && this.toggleSidePanel(true);
    if (formShortcut) {
      await this.addContentToClipAssistant(result);
    }
    return result;
  }

  async clipScreenOcr(params?: { isRunningHostPage: boolean; formShortcut: boolean }) {
    if (this.isOperateSelecting) {
      return;
    }
    const { isRunningHostPage = true, formShortcut = false } = params || {};

    if (formShortcut) {
      this.contentScriptAppRef?.current?.sendMessageToClipAssistant(ClipAssistantMessageActions.startScreenOcr);
      return;
    }

    this.isOperateSelecting = true;
    isRunningHostPage && this.toggleSidePanel(false);
    const result: string | null = await new Promise(resolve => {
      showScreenShot({
        dom: this.rootContainer,
        onScreenCancel: () => resolve(null),
        onScreenSuccess: resolve,
      });
    });
    this.isOperateSelecting = false;
    isRunningHostPage && this.toggleSidePanel(true);

    return result;
  }

  async addContentToClipAssistant(html: string, expandSidePanel?: boolean) {
    if (expandSidePanel) {
      this.toggleSidePanel(true);
    }
    return await this.contentScriptAppRef?.current?.addContentToClipAssistant(html);
  }

  async showMessage(config: ShowMessageConfig) {
    return this.contentScriptAppRef?.current?.showMessage(config);
  }
}

function initSandbox() {
  initI18N();
  window._yuque_ext_app = window._yuque_ext_app || new App();
}

initSandbox();
