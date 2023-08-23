import request from '@/core/request';
import { detect } from '../uitl';

export const wordMarkProxy = {
  async translate(srcTextList: string[]) {
    const srcLanguage = detect(srcTextList[0]);
    const tgtLanguage = srcLanguage === 'zh' ? 'en' : 'zh';
    return await request('/api/services/translate/text', {
      method: 'POST',
      data: {
        srcLanguage,
        srcTextList,
        tgtLanguage,
      },
    });
  },
};
