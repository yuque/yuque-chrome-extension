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

  // 判断是否是 beta 版插件，所有非商店的插件都判断为 beta 版本
  static get isBate() {
    if (chrome.runtime.getManifest().name.includes('Beta')) {
      return true;
    }
    return false;
  }

  // 是否运行在宿主页面,供 sidePanel 类 iframe 使用
  static get isRunningHostPage() {
    return window.self !== window.top;
  }
}

export default Env;
