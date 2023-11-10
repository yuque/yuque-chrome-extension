import { message } from 'antd';
import { BackgroundEvents } from '@/isomorphic/background';
import { detect } from '@/isomorphic/util';
import { ICallBridgeImpl } from '../index';

export interface ITag {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export function createWordMarkProxy(impl: ICallBridgeImpl) {
  return {
    async translate(
      srcText: string,
    ): Promise<{ result: string; }> {
      return new Promise((resolve, rejected) => {
        const srcLanguage = detect(srcText);
        const tgtLanguage = srcLanguage === 'zh' ? 'en' : 'zh';
        // 按照 。\n . 去拆分文字，避免翻译过长内容导致报错
        const srcTextList = srcText.split(/(?<=\n|。｜\.)/);
        impl(
          BackgroundEvents.OperateRequest,
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
              message.error(
                res.status === 400
                  ? __i18n('超出可翻译的字数上限，请减少选中内容')
                  : __i18n('翻译失败'),
              );
              rejected(res);
              return;
            }
            resolve({ result: res.data?.data?.join('') });
          },
        );
      });
    },
  };
}
