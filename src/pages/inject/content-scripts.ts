import $ from 'jquery';
import Chrome from '@/core/chrome';
import { GLOBAL_EVENTS, PAGE_EVENTS } from '@/events';
import { initI18N } from '@/isomorphic/i18n';
import {
  SandboxMessageType,
  YQ_SANDBOX_BOARD_IFRAME,
} from '@/isomorphic/constants';
import { contentExtensionBridge } from '@/pages/inject/inject-bridges';
import { initSelectArea } from './area-selector';
import { initWordMark, destroyWordMark } from './word-mark';

class App {
  private sandboxURL: string;
  private iframeClassName: string;

  constructor() {
    this.sandboxURL = Chrome.runtime.getURL('sandbox.html');
    this.iframeClassName = `sandbox-iframe-${Date.now()}`;
    this.bindEvent();
    window.addEventListener('message', e => {
      const data = e.data as { action: string; data: any };
      switch (data.action) {
        case PAGE_EVENTS.WORD_MARK_CLIP:
          this.saveToNote(data.data);
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

  showBoard() {
    const { sandboxURL, iframeClassName } = this;
    this.injectStyleIfNeeded(iframeClassName, this.iframeCSSFieldContent);
    const iframe = $(`iframe[src="${sandboxURL}"]`);
    if (!iframe[0]) {
      $('body').append(
        `<iframe src="${sandboxURL}" class="${iframeClassName} show" id="${YQ_SANDBOX_BOARD_IFRAME}"/>`,
      );
    }
    destroyWordMark();
  }

  removeIframe() {
    const { sandboxURL } = this;
    $(`iframe[src="${sandboxURL}"]`).remove();
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
    const { sandboxURL } = this;
    const iframe = $(`iframe[src="${sandboxURL}"]`);
    initSelectArea();
    if (!iframe[0]) {
      return;
    }
    iframe.removeClass('show');
  }

  saveToNote(data: any) {
    const { sandboxURL, iframeClassName } = this;
    this.injectStyleIfNeeded(iframeClassName, this.iframeCSSFieldContent);
    const iframe = $(`iframe[src="${sandboxURL}"]`);
    if (!iframe[0]) {
      const iframeToLoad = $(
        `<iframe src="${sandboxURL}" class="${iframeClassName} show" />`,
      );

      iframeToLoad.on('load', () => {
        const { selectionText } = data;
        Chrome.runtime.sendMessage({
          action: GLOBAL_EVENTS.GET_SELECTED_TEXT,
          HTMLs: [ selectionText ],
        });
      });

      $('body').append(iframeToLoad);
    }
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
        case GLOBAL_EVENTS.SAVE_TO_NOTE_IMAGE: {
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
  contentExtensionBridge.onMessage(SandboxMessageType.SHOW_BOARD, () => {
    window._yuque_ext_app.showBoard();
  });
}

function initSandbox() {
  initI18N();
  initBridge();

  window._yuque_ext_app = window._yuque_ext_app || new App();
}

initSandbox();

initWordMark();
