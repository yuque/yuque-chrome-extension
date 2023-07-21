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
