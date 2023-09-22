import request from '@/core/request';
import { detect } from '../uitl';

export const wordMarkProxy = {
  async translate(srcText: string) {
    const srcLanguage = detect(srcText);
    const tgtLanguage = srcLanguage === 'zh' ? 'en' : 'zh';
    // 按照 。\n . 去拆分文字，避免翻译过长内容导致报错
    const srcTextList = srcText.split(/(?<=\n|。｜\.)/);
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
