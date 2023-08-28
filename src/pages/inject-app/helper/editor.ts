const blockquoteID = 'yqextensionblockquoteid';

/**
 * 获取文档开头的html片段
 * @param useQuote 是否添加引用
 * @param needHeading 是否添加标题
 * @return {string} html片段
 */
export const getBookmarkHtml = (useQuote = false, needHeading = true) => {
  const ret = [];
  if (needHeading) {
    ret.push(`<h2>${document.title}</h2>`);
  }
  if (useQuote) {
    ret.push(
      `<blockquote><p>来自: <a href="${window.location.href}">${document.title}</a></p></blockquote>`,
    );
  } else {
    ret.push(`<p><a href="${window.location.href}">${document.title}</a></p>`);
  }
  return ret.join('');
};

/**
 * 获取文档开头的html片段
 * @return {heading: string, quote: string} html片段
 */
export const getBookmarkHTMLs = () => {
  const heading = `<h2>${document.title}</h2>`;
  const quote = `<p><br></p><blockquote id="${blockquoteID}"><p>来自: <a href="${window.location.href}">${document.title}</a></p></blockquote>`;
  return {
    heading,
    quote,
  };
};

/**
 * 获取追加的html片段
 * @return {string} html片段
 */
export const getCitation = () => {
  return `<p>来自: <a href="${window.location.href}">${window.location.href}</a></p>`;
};
