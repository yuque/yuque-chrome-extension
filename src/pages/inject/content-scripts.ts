import Chrome from '@/core/chrome';
import { initI18N } from '@/isomorphic/i18n';
import {
  ClipAssistantMessageActions,
  ClipAssistantMessageKey,
} from '@/isomorphic/event/clipAssistant';
import {
  SidePanelMessageActions,
  SidePanelMessageKey,
} from '@/isomorphic/event/sidePanel';
import {
  WordMarkMessageActions,
  WordMarkMessageKey,
} from '@/isomorphic/event/wordMark';
import {
  AccountLayoutMessageActions,
  AccountLayoutMessageKey,
} from '@/isomorphic/event/accountLayout';
import {
  LevitateBallMessageActions,
  LevitateBallMessageKey,
} from '@/isomorphic/event/levitateBall';
import {
  initContentScriptActionListener,
  initContentScriptMessageListener,
} from './action-listener';
import { createWordMark } from './WordMark';
import { createLevitateBall } from './LevitateBall';
import '@/styles/inject.less';

enum SidePanelStatus {
  // 还没有初始化
  UnInit = 'UnInit',

  // 正在加载中
  Loading = 'Loading',

  // 初始化完成
  InitReady = 'InitReady',

  // 展开
  Visible = 'Visible',

  // 隐藏
  Hidden = 'Hidden',
}

const YQ_SANDBOX_BOARD_IFRAME = 'yq-sandbox-board-iframe';

export class App {
  /**
   * 插件注入页面的 dom 的父节点
   */
  private _rootContainer: HTMLDivElement | null = null;

  /**
   * shadowRoot 节点
   */
  private _shadowRoot: ShadowRoot | null = null;

  /**
   * sidePanel iframe
   */
  private sidePanelIframe: HTMLIFrameElement | null = null;
  /**
   * sidePanelIframe 加载状态
   */
  private _sidePanelStatus: SidePanelStatus = SidePanelStatus.UnInit;
  private initSidePanelPromise: Promise<boolean> | undefined;
  private sidePanelClipReadyPromise: Promise<boolean> | undefined;
  /**
   * 是否在操作选取，如 ocr 截屏、dom 选取
   */
  public isOperateSelecting = false;

  public removeWordMark: VoidCallback = () => {
    //
  };

  public removeLevitateBall: VoidCallback = () => {
    //
  };

  constructor() {
    this.initRoot();
  }

  get rootContainer(): HTMLDivElement {
    return this._rootContainer as HTMLDivElement;
  }

  get shadowRoot(): ShadowRoot {
    return this._shadowRoot as ShadowRoot;
  }

  get sidePanelStatus() {
    return this._sidePanelStatus;
  }

  get sidePanelIsReady() {
    return this.sidePanelStatus !== SidePanelStatus.UnInit;
  }

  private initRoot() {
    const div = document.createElement('div');
    div.id = 'yuque-extension-root-container';
    div.classList.add('yuque-extension-root-container-class');
    const css = Chrome.runtime.getURL('content-scripts.css');
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
        // 创建好 wordMark
        this.removeWordMark = createWordMark({
          dom: this.rootContainer,
        });
        initContentScriptActionListener(this);
        initContentScriptMessageListener();
        this.initSidePanel();
        this.removeLevitateBall = createLevitateBall({
          dom: root,
        });
        // 搜索页二次搜索会清除掉一些 dom ，所以在 init 的时候需要判断我们挂载的 dom 是否还在，如果不在了，重新挂上去
        const observer = new MutationObserver((mutationsList: MutationRecord[]) => {
          for (const mutation of mutationsList) {
            if (Array.from(mutation.removedNodes).includes(div)) {
              this.sidePanelClipReadyPromise = undefined;
              document.body.appendChild(div);
            }
          }
        });
        // 监听页面 dom 是否被卸载
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      });
  }

  get iframeCSSFieldContent() {
    return `
      #${YQ_SANDBOX_BOARD_IFRAME} {
        display: none;
        border: none;
        margin: 0;
        padding: 0;
        min-height: 0;
        min-width: 0;
        overflow: hidden;
        position: fixed;
        transition: initial;
        max-width: 418px;
        max-height: 100vh;
        width: 418px;
        height: 100vh;
        right: 0;
        top: 0;
        z-index: 2147483645;
        color-scheme: none;
        user-select: none;
      }
      #${YQ_SANDBOX_BOARD_IFRAME}.show {
        display: block;
        color-scheme: auto;
      }
    `;
  }

  private async addListenClipAssistantReady(): Promise<boolean> {
    if (this.sidePanelClipReadyPromise) {
      return this.sidePanelClipReadyPromise;
    }
    this.sidePanelClipReadyPromise = new Promise(resolve => {
      const onMessage = (e: MessageEvent<any>) => {
        if (e.data.key !== ClipAssistantMessageKey) {
          return;
        }
        if (e.data.action === ClipAssistantMessageActions.ready) {
          resolve(true);
          window.removeEventListener('message', onMessage);
        }
      };
      window.addEventListener('message', onMessage);
    });
    return this.sidePanelClipReadyPromise;
  }

  private async initSidePanel(): Promise<boolean> {
    if (this.initSidePanelPromise) {
      return this.initSidePanelPromise;
    }
    this.initSidePanelPromise = new Promise(resolve => {
      // 先注入 iframe 对样式
      const style = document.createElement('style');
      style.textContent = this.iframeCSSFieldContent;
      this.shadowRoot.appendChild(style);
      // 创建 iframe
      const iframe = document.createElement('iframe');
      iframe.src = Chrome.runtime.getURL('sidePanel.html');
      iframe.id = YQ_SANDBOX_BOARD_IFRAME;
      this.rootContainer.appendChild(iframe);
      this.addListenClipAssistantReady();
      iframe.onload = () => {
        this._sidePanelStatus = SidePanelStatus.InitReady;
        this.sidePanelIframe = iframe;
        resolve(true);
      };
    });
    return this.initSidePanelPromise;
  }

  async removeIframe() {
    await this.initSidePanel();
    this.sidePanelIframe?.classList.remove('show');
    this.sidePanelIframe?.blur();
  }

  async hiddenSidePanel() {
    await this.initSidePanel();
    this.sidePanelIframe?.classList.remove('show');
    this.sidePanelIframe?.blur();
    this._sidePanelStatus = SidePanelStatus.Hidden;
  }

  private arouseSidePanel() {
    this.sidePanelIframe?.contentWindow?.postMessage(
      {
        key: SidePanelMessageKey,
        action: SidePanelMessageActions.arouse,
      },
      '*',
    );
  }

  async showSidePanel() {
    await this.initSidePanel();
    this.arouseSidePanel();
    this.sidePanelIframe?.classList.add('show');
    this._sidePanelStatus = SidePanelStatus.Visible;
  }

  async toggleSidePanel() {
    await this.initSidePanel();
    switch (this.sidePanelStatus) {
      case SidePanelStatus.InitReady: {
        this.showSidePanel();
        break;
      }
      case SidePanelStatus.Visible: {
        this.hiddenSidePanel();
        break;
      }
      case SidePanelStatus.Hidden: {
        this.showSidePanel();
        break;
      }
      default: {
        break;
      }
    }
  }

  async sendMessageToClipAssistant(
    action: ClipAssistantMessageActions,
    data?: any,
  ) {
    this.arouseSidePanel();
    await this.initSidePanel();
    await this.addListenClipAssistantReady();
    this.sidePanelIframe?.contentWindow?.postMessage(
      {
        key: ClipAssistantMessageKey,
        action,
        data,
      },
      '*',
    );
  }

  async sendMessageToAccountLayout(
    action: AccountLayoutMessageActions,
    data?: any,
  ) {
    // 通知所有的 accountLayout 去触发强制更新，使用到的地方有 setting 页，sidePanel 页
    this.sidePanelIframe?.contentWindow?.postMessage(
      {
        key: AccountLayoutMessageKey,
        action,
        data,
      },
      '*',
    );
  }

  async sendMessageToWordMark(action: WordMarkMessageActions, data?: any) {
    window.postMessage(
      {
        key: WordMarkMessageKey,
        action,
        data,
      },
      '*',
    );
  }

  async sendMessageToLevitateBall(
    action: LevitateBallMessageActions,
    data?: any,
  ) {
    window.postMessage(
      {
        key: LevitateBallMessageKey,
        action,
        data,
      },
      '*',
    );
  }
}

function initSandbox() {
  initI18N();
  window._yuque_ext_app = window._yuque_ext_app || new App();
}

initSandbox();
