export function isChinese(value: string): boolean {
  try {
    const re = /[^\u4e00-\u9fa5]/;
    return !re.test(value);
  } catch (e) {
    // ignore
  }

  return false;
}
