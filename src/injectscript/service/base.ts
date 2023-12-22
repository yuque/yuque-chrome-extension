import { InjectScriptResponseKey } from '@/isomorphic/injectScript';

export abstract class BaseService {
  public abstract name: string;
  public abstract urlRegExp: string;

  public enableRegister() {
    const regExp = new RegExp(this.urlRegExp);
    return regExp.test(window.location.href);
  }

  public callbackResponse(result: any, requestId: string) {
    window.postMessage(
      {
        key: InjectScriptResponseKey,
        requestId,
        data: { result },
      },
      '*',
    );
  }
}
