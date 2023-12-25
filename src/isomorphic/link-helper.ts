import { YUQUE_DOMAIN, pkg } from '@/config';
import Env from './env';

const LinkHelper = {
  goDoc: (doc: { id: number }) => `${YUQUE_DOMAIN}/go/doc/${doc.id}`,
  goMyNote: (id: number | string) => `${YUQUE_DOMAIN}/dashboard/notes?selectNoteId=${id}`,
  goMyPage: (account: { login: string }) => `${YUQUE_DOMAIN}/${account.login}`,
  feedback: () => {
    return `https://www.yuque.com/feedbacks/new?body=系统信息：浏览器插件/${Env.isBate ? 'Beta版' : '正式版'}/${
      pkg.version
    }，请详细描述你的问题：&label_ids=20031`;
  },
  dashboard: `${YUQUE_DOMAIN}/dashboard`,
  unInstallFeedback:
    'https://www.yuque.com/forms/share/c454d5b2-8b2f-4a73-851b-0f3d2ae585fb?chromeExtensionUninstall=true',
  introduceExtension: 'https://www.yuque.com/yuque/yuque-browser-extension/welcome#acYWK',
  ocrProxyPage: 'https://www.yuque.com/r/ocr_proxy_page',
  updateIframe: 'https://www.yuque.com/yuque/yuque-browser-extension/install?view=doc_embed',
  changelog: 'https://www.yuque.com/yuque/yuque-browser-extension/changelog',
  helpDoc: 'https://www.yuque.com/yuque/yuque-browser-extension/welcome',
  joinGroup: 'https://www.yuque.com/yuque/yuque-browser-extension/welcome#BQrrd',
  settingPage: chrome.runtime.getURL('setting.html'),
  wordMarkSettingPage: `${chrome.runtime.getURL('setting.html')}#wordMark`,
  shortcutSettingPage: `${chrome.runtime.getURL('setting.html')}#shortcut`,
  sidePanelSettingPage: `${chrome.runtime.getURL('setting.html')}#sidePanel`,
};

export default LinkHelper;
