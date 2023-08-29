export function transformDOM(domArray: Element[]) {
  const clonedDOMArray: Element[] = domArray.map(dom => {
    const div = document.createElement('div');
    div.appendChild(dom.cloneNode(true) as Element);
    return div;
  });

  // 处理克隆的 DOM
  clonedDOMArray.forEach((clonedDOM, clonedDOMIndex) => {
    // const original = originDomArray[clonedDOMIndex];
    // 替换 a 标签的链接
    const linkElements = clonedDOM.querySelectorAll('a');
    linkElements.forEach(a => {
      a.setAttribute('href', a.href);
    });

    // 替换 img 标签的链接
    const imgElements = clonedDOM.querySelectorAll('img');
    imgElements.forEach(img => {
      img.setAttribute('src', img.src);
    });

    // 移除 pre code 下的兄弟
    const preElements = clonedDOM.querySelectorAll('pre');
    preElements.forEach(pre => {
      const codeElement = pre.querySelectorAll('code')[0];
      if (codeElement) {
        const childNodes = pre.childNodes;
        childNodes.forEach(item => {
          if (item !== codeElement) {
            pre.removeChild(item);
          }
        });
      }
    });

    // 转化canvas为img
    const canvasElements = clonedDOM.querySelectorAll('canvas');
    if (canvasElements) {
      const originDom = domArray[clonedDOMIndex];
      const originalCanvasElements = originDom.querySelectorAll('canvas');

      /**
       * originDom 比原有 dom 少一个层级
       * 因此可能产生 originalCanvasElements 比 cloneCanvasElements 少一个对情况
       */
      if (originalCanvasElements.length < canvasElements.length) {
        canvasElements.forEach((canvas, index) => {
          const originCanvas =
            index === 0
              ? (originDom as HTMLCanvasElement)
              : originalCanvasElements[index - 1];
          const imageElement = document.createElement('img');
          imageElement.src = originCanvas.toDataURL();
          canvas.parentNode.replaceChild(imageElement, canvas);
        });
      } else {
        canvasElements.forEach(canvas => {
          const imageElement = document.createElement('img');
          imageElement.src = canvas.toDataURL();
          canvas.parentNode.replaceChild(imageElement, canvas);
        });
      }
    }
  });

  return clonedDOMArray.map(item => item.innerHTML);
}
