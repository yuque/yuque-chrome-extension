import { v4 as uuidv4 } from 'uuid';

const rChineseChar = /\p{Script=Han}+/gu;

const blockquoteID = 'yqextensionblockquoteid';

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

export const getBookmarkHTMLs = (params: { title: string; url: string }) => {
  const heading = `<h2>${params.title}</h2>`;
  const quote = `<p><br></p><blockquote id="${blockquoteID}"><p>来自: <a href="${params.url}">${params.title}</a></p></blockquote>`;
  return {
    heading,
    quote,
  };
};

async function urlToFile(url: string, filename: string) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error fetching the image from URL: ${url}`);
    }

    const blob = await response.blob();
    const file = new File([blob], filename, { type: blob.type });
    return file;
  } catch (error) {
    console.error('Error in urlToFile:', error);
    throw error;
  }
}

function isRelativePath(url: string) {
  try {
    new URL(url);
    return false;
  } catch (e) {
    return true;
  }
}

export async function transformUrlToFile(data: string | File) {
  let file: File | undefined;
  if (typeof data === 'string') {
    if (isRelativePath(data)) {
      data = chrome.runtime.getURL(data);
    }

    file = await urlToFile(data, 'image.jpg');
  } else {
    file = data;
  }
  return file;
}

export function getMsgId(options: { type: string; id?: number; timestamp?: number }) {
  const { type, timestamp, id = Date.now() } = options;
  const uuid = timestamp || uuidv4().replace(/-/g, '').substring(0, 8);
  return `${type}_${id}_${uuid}`;
}
