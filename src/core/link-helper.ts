import { YUQUE_DOMAIN } from '@/config';

const LinkHelper = {
  goDoc: (doc: {id:string}) => `${YUQUE_DOMAIN}/go/doc/${doc.id}`,
  goMyNote: () => `${YUQUE_DOMAIN}/dashboard/notes`,
  goMyPage: (account: {login: string}) => `${YUQUE_DOMAIN}/${account.login}`,
  unInstallFeedback: 'https://www.yuque.com/forms/share/c454d5b2-8b2f-4a73-851b-0f3d2ae585fb',
  introduceExtension: 'https://www.yuque.com/yuque/yuque-browser-extension/welcome#acYWK',
};

export default LinkHelper;
