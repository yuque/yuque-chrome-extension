import Chrome from '@/core/chrome';

export const sendMessageToBack = async (action: string, data?: any) => {
  return Chrome.runtime.sendMessage({
    action,
    data: data || {},
  });
};
