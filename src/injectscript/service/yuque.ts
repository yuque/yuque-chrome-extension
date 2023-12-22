import { BaseService } from './base';

export class YuqueService extends BaseService {
  public name = 'YuqueService';
  public urlRegExp = '^https://.*yuque.*com/';

  parseContent(params: { ids: string[] }) {
    const { ids } = params;
    const editor = document.querySelector('.ne-viewer-body');
    const result: string[] = [];
    for (const id of ids) {
      try {
        const html = (editor as any)?._neRef?.document.viewer.execCommand('getNodeContent', id, 'text/html');
        if (html) {
          result.push(html);
        }
      } catch (error) {
        //
      }
    }
    return result;
  }
}
