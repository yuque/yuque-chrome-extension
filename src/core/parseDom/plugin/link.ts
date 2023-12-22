import { BasePlugin } from './base';

export class LinkParsePlugin extends BasePlugin {
  public parse(cloneDom: HTMLElement): Promise<void> | void {
    const link = cloneDom.querySelectorAll('a');
    link.forEach(item => {
      item.setAttribute('href', item.href);
    });
  }
}
