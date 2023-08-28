import Chrome from '@/core/chrome';

export const sendMessageToInject = async (action: string, data?: any) => {
  return Chrome.runtime.sendMessage({
    action,
    data: data || {},
  });
};
