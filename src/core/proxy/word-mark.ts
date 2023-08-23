import request from '@/core/request';
import { isChinese } from '../uitl';

export const wordMarkProxy = {
  async translate(srcTextList: string[]) {
    const ch = isChinese(srcTextList[0])
    return await request('/api/services/translate/text', {
      method: 'POST',
      data: {
        srcLanguage: ch ? 'zh' : 'en',
        srcTextList,
        tgtLanguage: ch ? 'en' : 'zh',
      },
    });
  },
};
