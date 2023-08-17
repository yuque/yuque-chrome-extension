import $ from 'jquery';
import type { JQuery } from 'jquery';
import { EventEmitter } from 'eventemitter3';

interface AreaSelectionOptions {
  container?: JQuery;
}

class AreaSelection extends EventEmitter {
  container: JQuery;
  highlightClassName: string;
  prevElem: HTMLElement | null;
  excludedElems: Set<HTMLElement>;
  selectedElems: Set<HTMLElement>;
  overlay: JQuery | null;

  constructor(options: AreaSelectionOptions = {}) {
    super();
    this.container = options.container || $('html');
    this.highlightClassName = `hightlight-area-${Date.now()}`;
    this.prevElem = null;
    this.excludedElems = new Set();
    this.selectedElems = new Set();
    this.overlay = null;
    this.injectStyleIfNeeded(
      `${this.highlightClassName}-selected`,
      `
      .${this.highlightClassName}.selected {
        outline: 2px solid #009456 !important;
      }
    `,
    );
  }

  init(excludedElems: HTMLElement[] = []): void {
    this.createOverlay();
    this.injectStyle();
    this.bindEvent();
    excludedElems.forEach(elem => this.excludedElems.add(elem));
  }

  createOverlay(): void {
    this.overlay = $('<div>').attr('tabindex', '0').css({
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 9000,
    });
    this.container.append(this.overlay);
    this.overlay.focus();
  }

  injectStyleIfNeeded(className: string, css: string) {
    if (!$(`style.${className}`)[0]) {
      $('<style>').addClass(className).text(css)
        .appendTo('head');
    }
  }

  getClosestElem(target: EventTarget | null): HTMLElement | null {
    if (this.overlay && target === this.overlay[0]) {
      return null;
    }

    if (target instanceof HTMLElement && this.excludedElems.has(target)) {
      return null;
    }
    const containerElem = this.container[0];
    let elem: HTMLElement | null =
      target instanceof HTMLElement ? target : null;

    while (elem && elem !== containerElem) {
      if (elem.tagName && elem.tagName.toLowerCase() !== 'body') {
        return elem;
      }
      elem = elem.parentElement;
    }

    return null;
  }

  getSelectedElems(): Set<HTMLElement> {
    return this.selectedElems;
  }

  removeOverlay(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  clean(): void {
    const { highlightClassName } = this;

    // 去除所有元素的高亮类
    this.container
      .find(`.${highlightClassName}`)
      .removeClass(highlightClassName);

    // 去除所有选中元素的选中类，并清空集合
    this.selectedElems.forEach(elem => {
      $(elem).removeClass('selected');
    });
    this.selectedElems.clear();

    this.unbindEvent();
    this.removeOverlay();
    this.prevElem = null;
  }

  bindEvent(): void {
    if (!this.overlay) return;
    this.overlay.css({ pointerEvents: 'auto' });
    this.overlay.on('mousedown', this.onSelectedArea);
    this.overlay.on('mousemove', this.onMouseMove);
  }

  unbindEvent(): void {
    if (!this.overlay) return;
    this.overlay.css({ pointerEvents: 'none' });
    this.overlay.off('mousedown', this.onSelectedArea);
    this.overlay.off('mousemove', this.onMouseMove);
  }

  get cssFieldContent(): string {
    const { highlightClassName } = this;
    return `
      .${highlightClassName} {
        cursor: pointer !important;
        outline: 2px dashed #00b96b !important;
        opacity: 0.9 !important;
        transition: opacity 0.3s ease !important;
      };
    `;
  }

  injectStyle(): void {
    const { highlightClassName } = this;
    if ($(`#${highlightClassName}`)[0]) return;
    const style = document.createElement('style');
    style.id = highlightClassName;
    style.innerHTML = this.cssFieldContent;
    document.head.appendChild(style);
  }

  onMouseMove = (e: JQuery.Event): false | void => {
    e.stopPropagation();
    e.preventDefault();
    e.stopImmediatePropagation();

    // 暂时隐藏覆盖层
    if (this.overlay) {
      this.overlay.css('display', 'none');
    }

    const actualElem = document.elementFromPoint(e.clientX, e.clientY);
    const elem = this.getClosestElem(actualElem);

    // 恢复覆盖层的显示
    if (this.overlay) {
      this.overlay.css('display', 'block');
    }

    if (!elem) {
      this.prevElem && $(this.prevElem).removeClass(this.highlightClassName);
      this.prevElem = null;
      return;
    }

    if (elem === this.prevElem) {
      return;
    }

    if (this.prevElem) {
      // 如果元素未被选中，则删除高亮类
      if (!this.selectedElems.has(this.prevElem)) {
        $(this.prevElem).removeClass(this.highlightClassName);
      }
    }

    this.prevElem = elem;

    // 仅当元素未被选中时才添加高亮类并且没有父亲
    if (!this.selectedElems.has(this.prevElem) && !this.getParentSelected(elem)) {
      $(this.prevElem).addClass(this.highlightClassName);
    }
  };

  getParentSelected(elem) {
    let parent = null;
    this.selectedElems.forEach(exits => {
      if (exits.contains(elem)) {
        parent = exits;
      }
    });
    return parent;
  }

  toggleSelectedArea(elem: HTMLElement) {
    if (this.selectedElems.has(elem) || this.getParentSelected(elem)) {
      const target = this.getParentSelected(elem) || elem;
      $(target).removeClass(`${this.highlightClassName} selected`);
      this.selectedElems.delete(target);
      if (target.tagName.toLowerCase() === 'img') {
        delete (target as any).imageSrc;
      }
    } else {
      // 清理选择的子元素
      this.selectedElems.forEach(exits => {
        if (elem.contains(exits)) {
          $(exits).removeClass(`${this.highlightClassName} selected`);
          this.selectedElems.delete(exits);
        }
      });

      if (!this.getParentSelected(elem)) {
        $(elem).addClass(`${this.highlightClassName} selected`);
        this.selectedElems.add(elem);
        if (elem.tagName.toLowerCase() === 'img') {
          (elem as any).imageSrc = (elem as HTMLImageElement).src;
        }
      }

    }
    this.emit('change', this.selectedElems.size);
  }

  onSelectedArea = (e: JQuery.Event): false | void => {
    if (!this.prevElem) return;
    e.stopPropagation();
    e.preventDefault();
    e.stopImmediatePropagation(); // 添加此行以阻止原生页面事件
    // 通过切换区域的选定状态来更新选定元素集
    // 通过切换区域的选定状态来更新选定元素集
    if (e.type === 'mousedown') {
      // 添加此行来检查事件类型
      this.toggleSelectedArea(this.prevElem);
    }
  };
}

export default AreaSelection;
