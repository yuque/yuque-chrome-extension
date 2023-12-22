import { BasePlugin } from './base';

export class ImageParsePlugin extends BasePlugin {
  public parse(cloneDom: HTMLElement): Promise<void> | void {
    const images = cloneDom.querySelectorAll('img');
    images.forEach(image => {
      // 有些 img 采用 srcset 属性去实现，src 中放的其实是小图，所以以 currentSrc 作为渲染的 src
      image.setAttribute('src', image.currentSrc || image.src);
    });
  }
}
