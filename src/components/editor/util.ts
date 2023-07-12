export const encodeCardValue = (value): string => {
  let rst;
  try {
    rst = encodeURIComponent(JSON.stringify(value));
  } catch (e) {
    rst = '';
  }
  return `data:${rst}`;
};
