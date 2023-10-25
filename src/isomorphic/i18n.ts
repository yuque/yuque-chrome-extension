import locale from 'easy-i18n-cli/src/locale';

export function initI18N(globalOrWindow?: any) {
  let object = globalOrWindow;
  if (!object) {
    if (typeof window !== 'undefined') {
      object = window;
    } else if (typeof global !== 'undefined') {
      object = global;
    }
  }

  object.__i18n = locale({
    en: {},
    useEn: () => false,
  });
}

// 有些地方不态好注入 __i18n，将其暴露出来
export const __i18n: (text: string, params?: {[key: string]: string}) => string = locale({
  en: {},
  useEn: () => true,
});
