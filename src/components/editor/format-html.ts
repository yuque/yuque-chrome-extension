import TurndownService from 'turndown';
import marked from 'marked';

const formatHTML = (html: string): string => {
  const turndownService = new TurndownService();
  const md: string = turndownService.turndown(html);
  return marked(md);
};

export default formatHTML;
