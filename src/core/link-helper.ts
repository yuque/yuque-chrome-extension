import { YUQUE_DOMAIN } from '@/config';

const LinkHelper = {
  goDoc: (doc: {id:string}) => `${YUQUE_DOMAIN}/go/doc/${doc.id}`,
  goMyNote: () => `${YUQUE_DOMAIN}/dashboard/notes`,
  goMyPage: (account: {login: string}) => `${YUQUE_DOMAIN}/${account.login}`,
};

export default LinkHelper;
