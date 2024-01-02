import { BasePlugin } from './base';

export class ImageParsePlugin extends BasePlugin {
  public parse(cloneDom: HTMLElement): Promise<void> | void {
    const images = cloneDom.querySelectorAll('img');
    images.forEach(image => {
      /**
       * data-src 占位图
       * currentSrc 真实渲染的图片
       * src
       */
      image.setAttribute('src', image.getAttribute('data-src') || image.currentSrc || image.src);
    });
  }
}
