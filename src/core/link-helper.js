import { YUQUE_DOMAIN } from '@/config';

const LinkHelper = {
  goDoc: (doc) => `${YUQUE_DOMAIN}/go/doc/${doc.id}`,
  goMyNote: () => `${YUQUE_DOMAIN}/dashboard/notes`,
  goMyPage: (account) => `${YUQUE_DOMAIN}/${account.login}`,
};

export default LinkHelper;
