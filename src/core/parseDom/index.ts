import { Readability } from '@mozilla/readability';
import { CodeParsePlugin, ImageParsePlugin, LinkParsePlugin, HexoCodeParsePlugin, CanvasParsePlugin } from './plugin';
import { BasePlugin } from './plugin/base';
import { parsePageConfig } from './parsePageConfig';
import { screenShot } from '../screen-shot';

class ParseDom {
  private parsePlugin: BasePlugin[] = [];
  private filterConfig = parsePageConfig;

  constructor() {
    this.registerParsePlugin();
  }

  async parseDom(domArray: Element[]) {
    const result: Array<string> = [];
    for (const dom of domArray) {
      if (this.isYuqueContent(dom)) {
        try {
          const htmlArray = await this.parsePageYuqueContent(dom);
          result.push(htmlArray[0]);
          continue;
        } catch (error) {
          //
        }
      }
      const elements = await this.parseCommonDom([dom]);
      result.push(elements[0].outerHTML);
    }
    return result;
  }

  private async parseCommonDom(domArray: Element[]) {
    const cloneDomArray: Element[] = [];
    for (const originDom of domArray) {
      const cloneDom = originDom.cloneNode(true) as Element;
      // 对 clone 对一些提前对预处理
      await this.preProcessCloneDom(cloneDom, originDom);
      // 将所有 dom 按照 plugin 的注册顺序执行一次转化
      for (const plugin of this.parsePlugin) {
        const div = document.createElement('div');
        div.appendChild(cloneDom);
        await plugin.parse(div);
      }
      cloneDomArray.push(cloneDom);
    }
    return cloneDomArray;
  }

  async parsePage() {
    // 语雀的全文剪藏
    if (this.isYuqueContent(document.body)) {
      try {
        const result = await this.parsePageYuqueContent(document.body);
        return result.join('');
      } catch (error) {
        //
      }
    }
    // 普通页面的全文剪藏
    const result = await this.parseCommonPage();
    return result;
  }

  private async parseCommonPage() {
    const pageConfig = this.filterConfig;
    const rule = pageConfig.find(item => {
      const regExp = new RegExp(item.url);
      if (regExp.test(window.location.href)) {
        return item;
      }
      return null;
    });
    const originDomArray: Element[] = [];
    if (rule?.include.length) {
      rule.include.forEach(item => {
        const doms = document.querySelectorAll(item);
        doms.forEach(item => {
          originDomArray.push(item);
        });
      });
    } else {
      originDomArray.push(document.body);
    }
    // 先对 dom 做一些解析的预处理
    const cloneDomArray = await this.parseCommonDom(originDomArray);
    // 创建一个 fragment 片段用于存储 dom
    const fragment = document.createElement('div');
    cloneDomArray.forEach(item => fragment.appendChild(item));

    // Readability 会去除掉 style 并且无法配置，所以将 clone 下来的 dom 中 style 属性转移到 data-style 中去，
    const elementsWithStyle = fragment.querySelectorAll('[style]');
    elementsWithStyle.forEach(item => {
      const style = item.getAttribute('style');
      item.setAttribute('data-style', style as string);
    });

    // 如果对该网站做了特殊配置，去除掉 dom 里满足去除条件的 dom
    rule?.exclude?.forEach(item => {
      fragment.querySelectorAll(item).forEach(node => {
        node.parentNode?.removeChild(node);
      });
    });

    // 将 document clone 出一份
    const cloneDocument = document.cloneNode(true) as Document;
    Array.from(cloneDocument.body.children).forEach(item => item.parentNode?.removeChild(item));
    cloneDocument.body.appendChild(fragment);

    // 将内容交给 Readability 去解析一次
    const result = new Readability(cloneDocument, {
      keepClasses: true,
      disableJSONLD: true,
      serializer: async el => {
        // 如果 dom 上包含 data-style 将样式还原
        const elementsWithDataStyle = (el as HTMLElement).querySelectorAll('[data-style]');
        elementsWithDataStyle.forEach(item => {
          const dataStyle = item.getAttribute('data-style');
          item.setAttribute('style', dataStyle as string);
          item.removeAttribute('data-style');
        });
        return (el as HTMLElement).innerHTML;
      },
    }).parse();

    return result?.content;
  }

  private registerParsePlugin() {
    // 注册 parsePlugin 的插件，解析插件时会按照顺序执行
    this.parsePlugin.push(new LinkParsePlugin());
    this.parsePlugin.push(new ImageParsePlugin());
    this.parsePlugin.push(new CodeParsePlugin());
    this.parsePlugin.push(new HexoCodeParsePlugin());
    this.parsePlugin.push(new CanvasParsePlugin());
  }

  /**
   * 由于 parse 里面会对 clone dom 做一些特殊的处理
   * 会导致 clone dom 原有 dom 之间的结构不一致
   * 对于一些依赖原始 dom 的方法进行预处理，例如 canvas
   * 注意，这个方法里的所有处理函数，尽量不要对 clone dom 做节点的更改
   */
  private async preProcessCloneDom(cloneDom: Element, originDom: Element) {
    const cloneDomParent = document.createElement('div');
    cloneDomParent.append(cloneDom);
    const originDomParent = originDom.parentNode ? originDom.parentNode : document;
    // 对 canvas 做处理
    const originCanvasArray = originDomParent.querySelectorAll('canvas');
    const cloneCanvasArray = cloneDomParent.querySelectorAll('canvas');
    for (const [index, originCanvas] of originCanvasArray.entries()) {
      const cloneCanvas = cloneCanvasArray[index];
      // 对所有的 canvas 做一些 preset 处理
      try {
        const context = cloneCanvas.getContext('2d');
        // 将原始canvas的内容绘制到克隆的canvas中
        context?.drawImage(originCanvas, 0, 0);
      } catch (error) {
        //
      }
    }

    const originVideoArray = originDomParent.querySelectorAll('video');
    const cloneVideoArray = cloneDomParent.querySelectorAll('video');

    for (const [index, originVideo] of originVideoArray.entries()) {
      const rect = originVideo.getBoundingClientRect();
      const cloneVideo = cloneVideoArray[index];
      const canvas = await screenShot({
        x: rect.x,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });

      await new Promise(resolve => {
        const image = document.createElement('img');
        image.src = canvas.toDataURL('image/jpeg');
        cloneVideo.parentNode?.replaceChild(image, cloneVideo);
        resolve(true);
      });
    }
  }

  private isYuqueContent(element: Element) {
    if (element.closest('.ne-viewer-body') || element.querySelector('.ne-viewer-body')) {
      return true;
    }
    return false;
  }

  private async parsePageYuqueContent(element: Element) {
    let ids: string[] = [];
    if (element.classList.contains('ne-viewer-body')) {
      const childIds = this.findYuqueChildId(element);
      ids = ids.concat(childIds);
    } else if (element.closest('.ne-viewer-body')) {
      const id = this.findYuqueNeTag(element)?.id;
      if (id) {
        ids.push(id);
      }
    } else if (element.querySelector('.ne-viewer-body')) {
      const childIds = this.findYuqueChildId(element.querySelector('.ne-viewer-body'));
      ids = ids.concat(childIds);
    }
    const result = await window._yuque_ext_app.senMessageToPage({
      serviceName: 'YuqueService',
      serviceMethod: 'parseContent',
      params: {
        ids,
      },
    });
    return result;
  }

  private findYuqueChildId(element: Element | null) {
    let ids: string[] = [];
    if (!element) {
      return ids;
    }
    element.childNodes.forEach(item => {
      const id = (item as Element).id;
      if (id) {
        ids.push(id);
      } else {
        const childIds = this.findYuqueChildId(item as Element);
        ids = ids.concat(childIds);
      }
    });
    return ids;
  }

  private findYuqueNeTag(element: Element): Element | null {
    // 检查当前元素是否以 "ne" 开头的标签
    if (element.tagName.toLowerCase().startsWith('ne')) {
      return element;
    }

    // 递归查找父元素
    if (element.parentNode) {
      return this.findYuqueNeTag(element.parentNode as Element);
    }

    // 如果没有找到匹配的标签，则返回 null
    return null;
  }
}

export const parseDom = new ParseDom();
