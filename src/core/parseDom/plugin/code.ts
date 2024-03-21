import { BasePlugin } from './base';

export class CodeParsePlugin extends BasePlugin {
  /**
   * 查询所有 pre 节点
   * 并将 pre 节点下所有的 code 节点融合成一个新的 code 节点
   * <pre>
   *  <code><span>1</span></code>
   *  <ol><code>2</code></ol>
   * </pre>
   * 转化后
   * <pre>
   *  <code>
   *    <div>1</div>
   *  </code>
   *  <code>
   *    <div>2</div>
   *  </code>
   * </pre>
   */
  public parse(cloneDom: HTMLElement): Promise<void> | void {
    const preElements = cloneDom.querySelectorAll('pre');
    preElements.forEach(pre => {
      // 查询所有的代码块
      const codeElementArray = pre.querySelectorAll('code');
      /**
       *  有些页面的代码块不是
       *  <pre>xxxx</pre>
       *  对于这类不处理
       */
      if (!codeElementArray.length) {
        return;
      }
      Array.from(pre.childNodes).forEach(item => {
        pre.removeChild(item);
      });
      codeElementArray.forEach(code => {
        const div = document.createElement('div');
        Array.from(code.childNodes).forEach(item => {
          div.appendChild(item);
        });
        pre.appendChild(div);
      });
    });
  }
}
