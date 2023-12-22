import { BasePlugin } from './base';

export class CanvasParsePlugin extends BasePlugin {
  public parse(cloneDom: HTMLElement): Promise<void> | void {
    for (const canvasMap of cloneDom.querySelectorAll('canvas')) {
      const imageElement = document.createElement('img');
      imageElement.src = (canvasMap as HTMLCanvasElement).toDataURL();
      canvasMap.parentNode?.replaceChild(imageElement, canvasMap);
    }
  }
}
