export const encodeCardValue = (value: {
  src: string;
  originWidth?: number;
  originHeight?: number;
}): string => {
  let rst;
  try {
    rst = encodeURIComponent(JSON.stringify(value));
  } catch (e) {
    rst = '';
  }
  return `data:${rst}`;
};
