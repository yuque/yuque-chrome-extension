import { BasePlugin } from './base';

export class HexoCodeParsePlugin extends BasePlugin {
  public parse(cloneDom: HTMLElement): Promise<void> | void {
    const figures = cloneDom.querySelectorAll('figure');
    const processingCodeBlock = (node: HTMLElement) => {
      const gutter = node.querySelector('td.gutter');
      const code = node.querySelector('td.code');
      if (!gutter || !code) {
        return;
      }
      const codeElement = code.querySelector('pre');
      if (codeElement) {
        node.parentNode?.appendChild(codeElement);
      }
      node.parentNode?.removeChild(node);
    };
    figures.forEach(figure => {
      processingCodeBlock(figure);
    });
    if (figures.length === 0) {
      const tables = cloneDom.querySelectorAll('table');
      tables.forEach(table => {
        processingCodeBlock(table);
      });
    }
  }
}
