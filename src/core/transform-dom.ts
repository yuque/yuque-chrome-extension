import Chrome from '@/core/chrome';

function hexoCodeBlock(cloneNode: Element) {
  const figures = cloneNode.querySelectorAll('figure');
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
      const needRemoveNodes: ChildNode[] = [];
      const needMergeNodes: ChildNode[] = [];
      childNodes.forEach(item => {
        if ((item as Element)?.tagName === 'CODE' && item !== codeElement) {
          needMergeNodes.push(item);
        }
        if (item !== codeElement) {
          needRemoveNodes.push(item);
        }
      });
      // 将非 code 移除掉
      needRemoveNodes.forEach(item => {
        pre.removeChild(item);
      });
      // 将多 code 合成一个 dom
      needMergeNodes.forEach(item => {
        codeElement.appendChild(document.createElement('br'));
        item.childNodes.forEach(codeChild => codeElement.appendChild(codeChild));
      });
    }
  });
}

function transformHTML(html: string): string {
  // 清洗掉 span 标签之间的空格标签
  return html.replace(/<\/span> +<span/g, '</span>&nbsp;<span');
}

function findYuqueNeTag(element: Element) {
  // 检查当前元素是否以 "ne" 开头的标签
  if (element.tagName.toLowerCase().startsWith('ne')) {
    return element;
  }

  // 递归查找父元素
  if (element.parentNode) {
    return findYuqueNeTag(element.parentNode as Element);
  }

  // 如果没有找到匹配的标签，则返回 null
  return null;
}

function isYuqueContent(element: Element) {
  if (element.closest('.ne-viewer-body') || document.querySelector('.ne-viewer-body')) {
    return true;
  }
  return false;
}

async function transformYuqueContent(element: Element) {
  return new Promise(async (resolve, rejected) => {
    const onMessage = (e: MessageEvent<any>) => {
      if (e.data?.key !== 'tarnsfromYuqueContentValue') {
        return;
      }
      window.removeEventListener('message', onMessage);
      const result = e.data?.data?.result;
      if (!result || !result?.length) {
        transformError('result is empty');
      }
      const title = element.querySelector('#article-title')?.outerHTML;
      resolve(`${title || ''}${e.data?.data?.result?.join('\n')}`);
    };

    // 监听消息
    window.addEventListener('message', onMessage);

    const transformError = (params: any) => {
      window.removeEventListener('message', onMessage);
      rejected(params);
    };

    setTimeout(() => {
      transformError('transform timeout');
    }, 3000);

    await new Promise(resolve1 => {
      let script = document.querySelector('#yuque-content-transform-script') as HTMLScriptElement;
      if (script) {
        return resolve1(true);
      }
      script = document.createElement('script') as HTMLScriptElement;
      const file = Chrome.runtime.getURL('yuque-transform-script.js');
      script.id = 'yuque-content-transform-script';
      script.setAttribute('src', file);
      document.body.append(script);
      script.onload = () => {
        resolve1(true);
      };
    });

    const ids: string[] = [];
    if (element.classList.contains('.ne-viewer-body')) {
      element.childNodes.forEach(item => {
        const id = (item as Element).id;
        if (id) {
          ids.push(id);
        }
      });
    } else if (element.closest('.ne-viewer-body')) {
      const id = findYuqueNeTag(element)?.id;
      if (id) {
        ids.push(id);
      }
    } else if (element.querySelector('.ne-viewer-body')) {
      element.querySelector('.ne-viewer-body')?.childNodes.forEach(item => {
        const id = (item as Element).id;
        if (id) {
          ids.push(id);
        }
      });
    }

    window.postMessage(
      {
        key: 'tarnsfromYuqueContent',
        data: { ids },
      },
      '*',
    );
  });
}

export async function transformDOM(domArray: Element[]) {
  const yuqueDOMIndex: number[] = [];

  const clonedDOMArray: Element[] = domArray.map(dom => {
    if (isYuqueContent(dom)) {
      return dom;
    }
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

  for (let clonedDOMIndex = 0; clonedDOMIndex < clonedDOMArray.length; clonedDOMIndex++) {
    let clonedDOM = clonedDOMArray[clonedDOMIndex];

    if (isYuqueContent(clonedDOM)) {
      try {
        clonedDOMArray[clonedDOMIndex] = (await transformYuqueContent(clonedDOM)) as Element;
        yuqueDOMIndex.push(clonedDOMIndex);
        continue;
      } catch (error) {
        // 解析失败兜底走默认处理
        const div = document.createElement('div');
        div.appendChild(clonedDOM.cloneNode(true));
        clonedDOM = div;
      }
    }

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
            canvas.parentNode?.replaceChild(imageElement, canvas);
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
            canvas.parentNode?.replaceChild(imageElement, canvas);
          } catch (e) {
            //
          }
        });
      }
    }
  }

  return clonedDOMArray.map((item, index) => {
    if (yuqueDOMIndex.includes(index)) {
      return item;
    }
    return transformHTML(item.innerHTML);
  });
}
