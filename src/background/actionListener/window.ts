import { IOperateWindowData } from '@/isomorphic/background/window';
import Chrome from '@/background/core/chrome';
import { RequestMessage } from './index';

export function createWindowActionListener(
  request: RequestMessage<IOperateWindowData>,
  callback: (params: any) => void,
) {
  const { url } = request.data;
  Chrome.windows.create({
    url,
  });
  callback(true);
}
