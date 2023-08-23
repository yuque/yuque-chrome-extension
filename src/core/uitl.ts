
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
