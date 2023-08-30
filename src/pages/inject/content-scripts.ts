import $ from 'jquery';
import Chrome from '@/core/chrome';
import { GLOBAL_EVENTS, PAGE_EVENTS } from '@/events';
import { initI18N } from '@/isomorphic/i18n';
import { YQ_SANDBOX_BOARD_IFRAME } from '@/isomorphic/constants';
import { contentExtensionBridge } from '@/pages/inject/inject-bridges';
import { initSelectArea, selectAreaExisting } from './area-selector';
import { initWordMark, destroyWordMark } from './word-mark';
import { SandBoxMessageKey, SandBoxMessageType } from '@/isomorphic/sandbox';

class App {
  private iframeClassName: string;
  private iframe: HTMLIFrameElement;

  constructor() {
    this.iframeClassName = `sandbox-iframe-${Date.now()}`;
    this.bindEvent();
    this.initBoard();
    window.addEventListener('message', e => {
      const data = e.data as { action: string; data: any };
      switch (data.action) {
        case PAGE_EVENTS.WORD_MARK_CLIP:
          this.saveToNote(data.data);
          break;
        case GLOBAL_EVENTS.SHOW_BOARD:
          this.showBoard();
          break;
        default:
          break;
      }
    });
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
      .${iframeClassName} {
        display: none;
        border: none;
        margin: 0;
        padding: 0;
        min-height: 0;
        min-width: 0;
        overflow: hidden;
        position: fixed;
        transition: initial;
        width: 100%;
        height: 100%;
        right: 0;
        top: 0;
        z-index: 999999;
        background: rgba(0, 0, 0, 0.2);
        color-scheme: none;
      }
      .${iframeClassName}.show {
        display: block;
        color-scheme: auto;
      }
    `;
  }

  initBoard() {
    if (document.querySelector(`#${YQ_SANDBOX_BOARD_IFRAME}`)) {
      return;
    }
    const { iframeClassName } = this;
    this.injectStyleIfNeeded(iframeClassName, this.iframeCSSFieldContent);
    this.iframe = document.createElement('iframe');
    this.iframe.src = Chrome.runtime.getURL('sandbox.html');
    this.iframe.classList.add(iframeClassName);
    this.iframe.id = YQ_SANDBOX_BOARD_IFRAME;
    document.body.append(this.iframe);
  }

  showBoard() {
    this.iframe.classList.add('show');
    destroyWordMark();
  }

  showBoardWithSelection(type?: string) {
    if (!selectAreaExisting()) {
      this.iframe.classList.add('show');
      if (type) {
        this.iframe.contentWindow.postMessage(
          {
            key: SandBoxMessageKey,
            action: SandBoxMessageType.tryStartSelect,
            data: {
              type,
            },
          },
          '*',
        );
      }
      destroyWordMark();
    }
  }

  removeIframe() {
    this.iframe.classList.remove('show');
    initWordMark();
  }

  getPageHTML() {
    const body = $('html').clone();
    body.find('script').remove();
    body.find('style').remove();
    body.removeClass();
    return body.html();
  }

  startSelect() {
    initSelectArea();
    this.iframe.classList.remove('show');
    this.iframe.blur();
  }

  saveToNote(data: any) {
    const { selectionText } = data;
    this.showBoard();
    this.iframe.contentWindow.postMessage(
      {
        key: SandBoxMessageKey,
        action: SandBoxMessageType.getSelectText,
        data: {
          HTMLs: [ selectionText ],
        },
      },
      '*',
    );
  }

  bindEvent() {
    Chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
      switch (request.action) {
        case GLOBAL_EVENTS.SHOW_BOARD: {
          this.showBoard();
          sendResponse(true);
          return;
        }
        case GLOBAL_EVENTS.TRY_START_SELECT: {
          this.showBoardWithSelection(request.payload?.type);
          sendResponse(true);
          return;
        }
        case GLOBAL_EVENTS.START_SELECT: {
          this.startSelect();
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
