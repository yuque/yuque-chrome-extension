/**
 * 后续所有环境判断的方法都迁移到这里来
 */
class Env {
  static get isBackground(): boolean {
    return typeof window === 'undefined';
  }

  // 是否是插件的页面，插件的页面和 background 相类似，可以调用 chrome 系统的 api
  static get isExtensionPage() {
    if (!Env.isBackground) {
      const url = window.location.href;
      if (url.startsWith('chrome-extension://')) {
        return true;
      }
      return false;
    }
    return true;
  }
}

export default Env;
