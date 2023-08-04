import $ from 'jquery';
import Chrome from '@/core/chrome';
import { GLOBAL_EVENTS } from '@/events';
import AreaSelection from '@/components/area-selection';
import { initI18N } from '@/isomorphic/i18n';
import { SandboxMessageType } from '@/isomorphic/constants';
import { contentExtensionBridge } from '@/pages/inject/inject-bridges';

class App {
  private sandboxURL: string;
  private iframeClassName: string;
  private areaSelection: AreaSelection | null;

  constructor() {
    this.sandboxURL = Chrome.runtime.getURL('sandbox.html');
    this.iframeClassName = `sandbox-iframe-${Date.now()}`;
    this.areaSelection = null;

    this.bindEvent();
  }

  private maskCls = '_yq_ext_tip-mask';
  private submitBtnCls = '_yq_ext_submit-selection';

  private createTipMask() {
    // 创建遮罩层和提示信息，并添加样式
    const mask = $('<div>')
      .addClass(this.maskCls)
      .css({
        display: 'flex',
        boxSizing: 'border-box',
        alignItems: 'center',
        position: 'fixed',
        top: '10%', // 靠上的位置，可以根据需要调整
        left: '50%',
        height: 40,
        padding: '0 12px',
        fontSize: 14,
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 9998,
        borderRadius: '10px', // 圆角矩形
        textAlign: 'center',
        pointerEvents: 'none', // 遮罩层不需要响应鼠标事件
        color: '#fff',
      })
      .text('单击区域以选中，再次单击取消选中。ESC 退出， ↲ 完成。')
      .appendTo('body');

    return mask;
  }

  private removeTipMask() {
    $(`.${this.maskCls}`).remove();
  }

  private updateSelectedCounter() {
    this.areaSelection.on('change', count => {
      $(`.${this.submitBtnCls}`).text(`确认选取 (${count})`);
    });
  }

  private createConfirmButton(iframe) {
    const submitBtn = $('<div>')
      .addClass(this.submitBtnCls)
      .text('确认选取')
      .css({
        height: 24,
        lineHeight: '24px',
        marginLeft: 42,
        backgroundColor: '#00B96B',
        boxSizing: 'border-box',
        borderColor: '#00B96B', // @primary-color
        borderRadius: 4,
        cursor: 'pointer',
        display: 'inline-block',
        color: '#fff',
        fontSize: 12,
        fontWeight: 400,
        padding: '0 8px',
        textAlign: 'center',
        touchAction: 'manipulation',
        userSelect: 'none',
        verticalAlign: 'middle',
        whiteSpace: 'nowrap',
        textDecoration: 'none',
        pointerEvents: 'all',
        transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
      })
      .appendTo(`.${this.maskCls}`)
      .on('click', async () => {
        const selectedElems = this.areaSelection.getSelectedElems();
        const HTMLs = Array.from(selectedElems).map(elem =>
          $(elem).prop('outerHTML'),
        );

        // 提前获取光标
        iframe.addClass('show');
        iframe.focus();
        Chrome.runtime.sendMessage(
          {
            action: GLOBAL_EVENTS.GET_SELECTED_HTML,
            HTMLs,
          },
          () => {
            iframe.focus();
          },
        );
        this.areaSelection.clean();
        submitBtn.remove();
        this.removeTipMask();
      });

    submitBtn.hover(
      function() {
        $(this).css({
          backgroundColor: '#00b96b',
          borderColor: '#00b96b',
        });
      },
      function() {
        $(this).css({
          backgroundColor: '#009456',
          borderColor: '#009456',
        });
      },
    );

    this.updateSelectedCounter();

    return submitBtn;
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const { key } = e;
    if (key === 'Escape' || key === 'Esc') {
      this.areaSelection.clean();
      this.removeConfirmButton();
      this.removeTipMask();
    } else if (key === 'Enter') {
      this.confirmSelection();
      this.removeTipMask();
    }
  };

  private confirmSelection() {
    const selectedElems = this.areaSelection.getSelectedElems();
    const HTMLs = Array.from(selectedElems).map(elem =>
      $(elem).prop('outerHTML'),
    );

    const { sandboxURL } = this;
    const iframe = $(`iframe[src="${sandboxURL}"]`);
    iframe.addClass('show');
    iframe.focus();
    Chrome.runtime.sendMessage(
      {
        action: GLOBAL_EVENTS.GET_SELECTED_HTML,
        HTMLs,
      },
      () => {
        iframe.focus();
      },
    );
    this.areaSelection.clean();
    this.removeConfirmButton();
  }

  private removeConfirmButton() {
    const { sandboxURL } = this;
    $(`.${this.submitBtnCls}`).remove();
    const iframe = $(`iframe[src="${sandboxURL}"]`);
    iframe.addClass('show');
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
        `<iframe src="${sandboxURL}" class="${iframeClassName} show" />`,
      );
    }
  }

  removeIframe() {
    const { sandboxURL } = this;
    $(`iframe[src="${sandboxURL}"]`).remove();
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
    if (!iframe[0]) {
      return;
    }

    iframe.removeClass('show');
    this.areaSelection = this.areaSelection || new AreaSelection();

    const mask = this.createTipMask();
    const confirmSelectionButton = this.createConfirmButton(iframe);

    this.areaSelection.init([ confirmSelectionButton[0], mask[0] ]);
    /**
     * 当开始选取时，延时 300ms 切换焦点，避免 document.activeElement 区域在 iframe
     * 导致监听的 keydown 失效
     */
    setTimeout(() => {
      this.areaSelection.overlay.focus();
    }, 300);
    document.addEventListener('keydown', this.handleKeyDown);
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
