import { message } from 'antd';
import { detect } from '@/isomorphic/util';
import { httpProxy } from './base';

export function createWordMarkProxy() {
  return {
    async translate(srcText: string): Promise<string> {
      const srcLanguage = detect(srcText);
      const tgtLanguage = srcLanguage === 'zh' ? 'en' : 'zh';
      // 按照 。\n . 去拆分文字，避免翻译过长内容导致报错
      const srcTextList = srcText.split(/(?<=\n|。｜\.)/);
      return new Promise((resolve, reject) => {
        httpProxy.sendMethodCallToBackground(
          {
            url: '/api/services/translate/text',
            config: {
              method: 'POST',
              data: {
                srcLanguage,
                srcTextList,
                tgtLanguage,
              },
            },
          },
          res => {
            if (res.status !== 200) {
              message.error(res.status === 400 ? __i18n('超出可翻译的字数上限，请减少选中内容') : __i18n('翻译失败'));
              reject(res);
              return;
            }
            resolve(res.data?.data?.join('') || '');
            return;
          },
        );
      });
    },
  };
}
