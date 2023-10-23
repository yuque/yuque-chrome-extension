import { IOperateRequestData } from '@/isomorphic/background/request';
import requestFn, { uploadFile } from '@/background/core/request';
import { transformUrlToFile } from '@/isomorphic/util';
import { RequestMessage } from './index';

export async function createRequestActionListener(
  request: RequestMessage<IOperateRequestData>,
  callback: (params: any) => void,
) {
  const { url, config, options = {} } = request.data;

  try {
    if (options.isFileUpload) {
      const file = await transformUrlToFile(config.data);
      const response = await uploadFile(url, file);
      callback(response);
      return;
    }

    const res = await requestFn(url, config, options);
    callback(res);
  } catch (error) {
    callback(error);
  }
}
