import { BaseService } from './base';

export class CommonService extends BaseService {
  public name = 'CommonService';
  public urlRegExp = '';

  enableDocumentCopy() {
    if (typeof (window as any)?.appData?.book?.enable_document_copy === 'boolean') {
      return (window as any).appData.book.enable_document_copy;
    }
    return true;
  }
}
