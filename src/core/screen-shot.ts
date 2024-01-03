import { backgroundBridge } from './bridge/background';

interface IScreenShotOptions {
  width: number;
  height: number;
  x: number;
  y: number;
}

export async function screenShot(options: IScreenShotOptions): Promise<HTMLCanvasElement> {
  return new Promise(async (resolve, rejected) => {
    const base64: any = await backgroundBridge.tab.screenShot();
    try {
      const image = new Image();
      image.src = base64;
      image.onload = () => {
        const imageWidthRatio = image.width / window.innerWidth;
        const imageHeightRatio = image.height / window.innerHeight;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // 设置截取区域的坐标和宽高
        const x = options.x * imageWidthRatio; // 区域的左上角x坐标
        const y = options.y * imageHeightRatio; // 区域的左上角y坐标
        const width = options.width * imageWidthRatio; // 区域的宽度
        const height = options.height * imageHeightRatio; // 区域的高度
        // 在canvas上绘制截取区域
        canvas.width = width;
        canvas.height = height;
        context?.drawImage(image, x, y, width, height, 0, 0, width, height);
        resolve(canvas);
      };
    } catch (error) {
      rejected(error);
    }
  });
}
