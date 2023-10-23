import { YUQUE_DOMAIN } from '@/config';

const LinkHelper = {
  goDoc: (doc: { id: number }) => `${YUQUE_DOMAIN}/go/doc/${doc.id}`,
  goMyNote: () => `${YUQUE_DOMAIN}/dashboard/notes`,
  goMyPage: (account: { login: string }) => `${YUQUE_DOMAIN}/${account.login}`,
  dashboard: `${YUQUE_DOMAIN}/dashboard`,
  unInstallFeedback:
    'https://www.yuque.com/forms/share/c454d5b2-8b2f-4a73-851b-0f3d2ae585fb?chromeExtensionUninstall=true',
  introduceExtension:
    'https://www.yuque.com/yuque/yuque-browser-extension/welcome#acYWK',
  ocrProxyPage: 'https://www.yuque.com/r/ocr_proxy_page',
  updateIframe:
    'https://www.yuque.com/yuque/yuque-browser-extension/install?view=doc_embed',
  changelog: 'https://www.yuque.com/yuque/yuque-browser-extension/changelog',
  helpDoc: 'https://www.yuque.com/yuque/yuque-browser-extension/welcome',
  feedback: 'https://www.yuque.com/feedbacks/new',
  joinGroup:
    'https://www.yuque.com/yuque/yuque-browser-extension/welcome#BQrrd',
};

export default LinkHelper;
