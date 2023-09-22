import $ from 'jquery';
import Chrome from '@/core/chrome';
import { GLOBAL_EVENTS } from '@/events';
import { initI18N } from '@/isomorphic/i18n';
import {
  StartSelectEnum,
  YQ_SANDBOX_BOARD_IFRAME,
} from '@/isomorphic/constants';
import { contentExtensionBridge } from '@/pages/inject/inject-bridges';
import {
  ClippingTypeEnum,
  SandBoxMessageKey,
  SandBoxMessageType,
} from '@/isomorphic/sandbox';
import { initSelectArea, destroySelectArea } from './selector';
import { initWordMark, destroyWordMark } from './word-mark';

class App {
  private iframeClassName: string;
  private iframe: HTMLIFrameElement | null = null;

  constructor() {
    this.iframeClassName = `sandbox-iframe-${Date.now()}`;
    this.bindEvent();
    this.initBoard();
  }

  injectStyleIfNeeded(className: string, css: string) {
    if ($(`#${className}`)[0]) {
      return;
    }

    const style = document.createElement('style');
    style.id = className;
    style.innerHTML = css;
    document.head.appendChild(style);
  }

  get iframeCSSFieldContent() {
    const { iframeClassName } = this;
    return `
      #${YQ_SANDBOX_BOARD_IFRAME}.${iframeClassName} {
        display: none;
        border: none;
        margin: 0;
        padding: 0;
        min-height: 0;
        min-width: 0;
        overflow: hidden;
        position: fixed;
        transition: initial;
        max-width: 100vw;
        max-height: 100vh;
        width: 100vw;
        height: 100vh;
        right: 0;
        top: 0;
        z-index: 999999;
        background: rgba(0, 0, 0, 0.2);
        color-scheme: none;
        user-select: none;
      }
      #${YQ_SANDBOX_BOARD_IFRAME}.${iframeClassName}.show {
        display: block;
        color-scheme: auto;
      }
    `;
  }

  initBoard() {
    if (this.iframe) {
      return;
    }
    const { iframeClassName } = this;
    this.injectStyleIfNeeded(iframeClassName, this.iframeCSSFieldContent);
    const iframe = document.createElement('iframe');
    iframe.src = Chrome.runtime.getURL('sandbox.html');
    iframe.classList.add(iframeClassName);
    iframe.id = YQ_SANDBOX_BOARD_IFRAME;
    document.body.append(iframe);
    iframe.onload = () => {
      this.iframe = iframe;
    };
  }

  showBoard() {
    if (!this.iframe) {
      return;
    }
    this.iframe?.classList.add('show');
    this.iframe?.contentWindow?.postMessage(
      {
        key: SandBoxMessageKey,
        action: SandBoxMessageType.initSandbox,
      },
      '*',
    );
    this.iframe?.focus();
    destroyWordMark();
    destroySelectArea();
  }

  removeIframe() {
    this.iframe?.classList.remove('show');
    this.iframe?.blur();
    initWordMark();
  }

  getPageHTML() {
    const body = $('html').clone();
    body.find('script').remove();
    body.find('style').remove();
    body.removeClass();
    return body.html();
  }

  startSelect(data: { type: StartSelectEnum }) {
    initSelectArea(data);
    this.iframe?.classList.remove('show');
  }

  saveToNote(data: any) {
    const { selectionText } = data;
    this.iframe?.contentWindow?.postMessage(
      {
        key: SandBoxMessageKey,
        action: SandBoxMessageType.getSelectedHtml,
        data: {
          HTMLs: [selectionText],
          type: ClippingTypeEnum.area,
        },
      },
      '*',
    );
    this.showBoard();
  }

  bindEvent() {
    Chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
      switch (request.action) {
        case GLOBAL_EVENTS.SHOW_BOARD: {
          this.showBoard();
          sendResponse(true);
          return;
        }
        case GLOBAL_EVENTS.START_SELECT: {
          this.startSelect(request.data);
          sendResponse(true);
          return;
        }
        case GLOBAL_EVENTS.CLOSE_BOARD: {
          this.removeIframe();
          sendResponse(true);
          return;
        }
        case GLOBAL_EVENTS.GET_PAGE_HTML: {
          const html = this.getPageHTML();
          sendResponse(html);
          return;
        }
        case GLOBAL_EVENTS.SAVE_TO_NOTE: {
          this.saveToNote(request);
          sendResponse(true);
          return;
        }
        default:
          sendResponse(true);
      }
    });
  }
}

function initBridge() {
  contentExtensionBridge.connect();
}

function initSandbox() {
  initI18N();
  initBridge();

  window._yuque_ext_app = window._yuque_ext_app || new App();
}

initSandbox();

initWordMark();
