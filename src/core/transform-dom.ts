function hexoCodeBlock(cloneNode: Element) {
  const figures = cloneNode.querySelectorAll('figure');
  const processingCodeBlock = (node: HTMLElement) => {
    const gutter = node.querySelector('td.gutter');
    const code = node.querySelector('td.code');
    if (!gutter || !code) {
      return;
    }
    const codeElement = code.querySelector('pre');
    node.parentNode.appendChild(codeElement);
    node.parentNode.removeChild(node);
  };
  figures.forEach(figure => {
    processingCodeBlock(figure);
  });
  if (figures.length === 0) {
    const tables = cloneNode.querySelectorAll('table');
    tables.forEach(table => {
      processingCodeBlock(table);
    });
  }
}

function commonCodeBlock(node: Element) {
  const preElements = node.querySelectorAll('pre');
  preElements.forEach(pre => {
    const codeElement = pre.querySelector('code');
    if (codeElement) {
      const childNodes = pre.childNodes;
      childNodes.forEach(item => {
        if (item !== codeElement) {
          pre.removeChild(item);
        }
      });
    }
  });
}

export function transformDOM(domArray: Element[]) {
  const clonedDOMArray: Element[] = domArray.map(dom => {
    const cloneDom = dom.cloneNode(true) as Element;
    const div = document.createElement('div');
    if (cloneDom.tagName === 'CODE') {
      const pre = document.createElement('pre');
      pre.appendChild(cloneDom);
      div.appendChild(pre);
    } else {
      div.appendChild(cloneDom);
    }
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
    commonCodeBlock(clonedDOM);

    // 处理 hexo 代码
    hexoCodeBlock(clonedDOM);

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
          try {
            const originCanvas =
              index === 0
                ? (originDom as HTMLCanvasElement)
                : originalCanvasElements[index - 1];
            const imageElement = document.createElement('img');
            imageElement.src = originCanvas.toDataURL();
            canvas.parentNode.replaceChild(imageElement, canvas);
          } catch (e) {
            //
          }
        });
      } else {
        canvasElements.forEach((canvas, index) => {
          try {
            const originCanvas = originalCanvasElements[index];
            const imageElement = document.createElement('img');
            imageElement.src = originCanvas.toDataURL();
            canvas.parentNode.replaceChild(imageElement, canvas);
          } catch (e) {
            //
          }
        });
      }
    }
  });

  return clonedDOMArray.map(item => item.innerHTML);
}
