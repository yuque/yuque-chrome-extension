import { backgroundBridge } from '@/core/bridge/background';
import { BasePlugin } from './base';

export class ImageParsePlugin extends BasePlugin {
  public async parse(cloneDom: HTMLElement): Promise<void> {
    const images = cloneDom.querySelectorAll('img');
    const requestArray = Array.from(images).map(image => {
      return new Promise(async resolve => {
        image.setAttribute('src', image.getAttribute('data-src') || image.currentSrc || image.src);
        const isOriginImage = /^(http|https):\/\//.test(image.src);
        if (!isOriginImage) {
          resolve(true);
          return;
        }
        try {
          const response = await fetch(image.src);
          if (response.status !== 200) {
            throw new Error('Error fetching image');
          }
          const blob = await response.blob(); // 将响应体转换为 Blob
          const reader = new FileReader();
          reader.readAsDataURL(blob); // 读取 Blob 数据并编码为 Base64
          reader.onloadend = () => {
            // 获取 Base64 编码的数据
            const base64data = reader.result;
            image.src = base64data as string;
            resolve(true);
          };
        } catch (e: any) {
          // 补充一次图片请求，避免被拦截
          try {
            const base64 = await backgroundBridge.clip.getImage(image.src);
            if (base64) {
              image.src = base64;
            }
          } catch (error) {
            //
          }
          resolve(true);
        }
      });
    });
    await Promise.all(requestArray);
  }
}
