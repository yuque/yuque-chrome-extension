import { YUQUE_DOMAIN } from '@/config';

const LinkHelper = {
  goDoc: (doc: any) => `${YUQUE_DOMAIN}/go/doc/${doc.id}`,
  goMyNote: () => `${YUQUE_DOMAIN}/dashboard/notes`,
  goMyPage: (account: any) => `${YUQUE_DOMAIN}/${account.login}`,
};

export default LinkHelper;
