import { IOperateRequestData } from '@/isomorphic/background/request';
import requestFn from '@/background/core/request';
import { RequestMessage } from './index';

export async function createRequestActionListener(
  request: RequestMessage<IOperateRequestData>,
  callback: (params: any) => void,
) {
  const { url, config, options = {} } = request.data;
  const res = await requestFn(url, config, options);
  callback(res);
}
