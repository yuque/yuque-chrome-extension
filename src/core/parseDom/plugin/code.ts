import { BasePlugin } from './base';

export class CodeParsePlugin extends BasePlugin {
  /**
   * 查询所有 pre 节点
   * 并将 pre 节点下所有的 code 节点融合成一个新的 code 节点
   * <pre>
   *  <code>1</code>
   *  <ol><code>2</code></ol>
   * </pre>
   * 转化后
   * <pre>
   *  <code>
   *    <div>1</div>
   *    <div>2</div>
   *  </code>
   * </pre>
   */
  public parse(cloneDom: HTMLElement): Promise<void> | void {
    const preElements = cloneDom.querySelectorAll('pre');
    preElements.forEach(pre => {
      // 查询所有的代码块
      const codeElementArray = pre.querySelectorAll('code');
      const code = document.createElement('code');
      for (const codeElement of codeElementArray) {
        Array.from(codeElement.childNodes).forEach(item => {
          code.appendChild(item);
        });
      }
      Array.from(pre.childNodes).forEach(item => {
        pre.removeChild(item);
      });
      pre.appendChild(code);
      console.log(pre);
    });
  }
}
