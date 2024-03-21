import LinkHelper from '@/isomorphic/link-helper';
import { replaceTextPunc } from '@/isomorphic/util';

interface IOcrResultItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
export type IStartOcrResult = IOcrResultItem[];
const key = 'ocr-message';
const getRequestID = (() => {
  let id = 0;
  return () => {
    id++;
    return id;
  };
})();

export enum EnableOcrStatus {
  enable = 'enable',

  disable = 'disable',

  unknown = 'unknown',
}

class OCRManager {
  private iframe: HTMLIFrameElement | undefined;
  private ocrIframeId = 'yq-ocr-iframe-id';
  private sendMessageRef: ((requestData: { action: string; data?: any }) => Promise<any>) | undefined;
  private initSidePanelPromise: Promise<boolean> | undefined;
  private ocrQueue: Array<{
    task: () => Promise<Array<IOcrResultItem>>;
    resolve: (res: Array<IOcrResultItem>) => void;
  }> = [];
  // 当前运行数
  private runningTasks = 0;
  // 最大的任务运行数
  private concurrentTasks = 5;

  async init() {
    if (this.initSidePanelPromise) {
      return this.initSidePanelPromise;
    }
    this.initSidePanelPromise = new Promise(resolve => {
      this.iframe = document.createElement('iframe');
      this.iframe.src = LinkHelper.ocrProxyPage;
      this.iframe.id = this.ocrIframeId;
      this.iframe.style.display = 'none';
      document.body.appendChild(this.iframe);
      const resolveCache: Map<number, (data: any) => void> = new Map();
      const messageFunc = (event: MessageEvent<any>) => {
        if (event.data.key !== key) return;
        if (resolveCache.has(event.data.requestId)) {
          resolveCache.get(event.data.requestId)?.(event.data);
          resolveCache.delete(event.data.requestId);
        }
        if (event.data.type === 'ocr-ready') {
          console.log('ocr is ready');
          this.sendMessageRef = requestData =>
            new Promise(resolve1 => {
              const requestId = getRequestID();
              resolveCache.set(requestId, data => {
                resolve1(data);
              });
              this.iframe?.contentWindow?.postMessage(
                {
                  key,
                  requestId,
                  ...requestData,
                },
                '*',
              );
            });
          resolve(true);
        }
      };
      // 30s 还没有加载好 ocr 结束等待
      setTimeout(() => {
        resolve(false);
      }, 1000 * 30);
      window.addEventListener('message', messageFunc);
    });
    return this.initSidePanelPromise;
  }

  private async executeOcr(type: 'file' | 'blob' | 'url', content: File | Blob | string) {
    // 调用 ocr 时，开始 ocr 等预热
    await this.init();
    const enableOcrStatus = await ocrManager.isWebOcrReady();
    if (enableOcrStatus !== EnableOcrStatus.enable) {
      console.log('ocr is not ready');
      return [];
    }
    const res = await this.sendMessage('startOcr', {
      type,
      content,
    });
    const ocrResult: IStartOcrResult = res?.data || [];
    try {
      const result = ocrResult.filter(item => !isNaN(item.x) && !isNaN(item.y));
      result.sort((a, b) => {
        if (a.y !== b.y) {
          return a.y - b.y; // 先按照 y 排序
        }
        return a.x - b.x; // 在 y 相等的情况下按照 x 排序
      });
      return result.map(item => ({
        ...item,
        text: replaceTextPunc(item.text).toLowerCase(),
      }));
    } catch (e) {
      //
    }
    return [];
  }

  async startOCR(type: 'file' | 'blob' | 'url', content: File | Blob | string) {
    return await new Promise(resolve => {
      this.ocrQueue.push({ resolve, task: () => this.executeOcr(type, content) });
      this.dequeue();
    });
  }

  private dequeue() {
    if (this.runningTasks >= this.concurrentTasks || !this.ocrQueue.length) {
      return;
    }
    const { task, resolve } = this.ocrQueue.shift()!;
    this.runningTasks++;
    task().then((res: any) => {
      this.runningTasks--;
      resolve(res);
      this.dequeue();
    });
  }

  async isWebOcrReady() {
    const result = await this.sendMessage('isWebOcrReady');
    if (!result) {
      return EnableOcrStatus.unknown;
    }
    return result.data ? EnableOcrStatus.enable : EnableOcrStatus.disable;
  }

  private sendMessage(action: string, data?: any) {
    if (!this.sendMessageRef) {
      return;
    }
    return this.sendMessageRef({
      action,
      data,
    });
  }
}

export const ocrManager = new OCRManager();
