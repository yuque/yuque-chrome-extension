import Bowser from "bowser";

const rChineseChar = /\p{Script=Han}+/ug;

export function detect(text: string) {
  let count = 0;
  let match: any;

  // 重置 lastIndex
  rChineseChar.lastIndex = 0;
  while ((match = rChineseChar.exec(text)) != null) {
    count += match[0].length;
    // 20% 字符就英文是中文了
    if (count / text.length > 0.2) return 'zh';
  }

  // 其他情况暂时都返回 auto
  return 'auto';
}

const CHINESE_CHAR_REG = /[\u3400-\u9FBF]/;

const punctuationMarks: Record<string, string> = {
  '!': '！',
  '?': '？',
  ',': '，',
  '.': '。',
  ':': '：',
  ';': '；',
  '(': '（',
  ')': '）',
  '[': '【',
  ']': '】',
  '<': '《',
  '>': '》',
};

export function replaceTextPunc(text: string) {
  return text.replace(/[\!\?\,\.\:\;\(\)\[\]\<\>]/g, (punc, index) => {
    const prevCh = text[index - 1];
    if (prevCh && CHINESE_CHAR_REG.test(prevCh)) {
      return punctuationMarks[punc] || punc;
    }
    return punc;
  });
}

export function findCookieSettingPage() {
  const browserName = Bowser.getParser(navigator.userAgent).getBrowserName();
  if (browserName === 'Microsoft Edge') {
    return 'edge://settings/content';
  }

  if (browserName === 'Chrome') {
    return 'chrome://settings/cookies';
  }
  return '';
}
