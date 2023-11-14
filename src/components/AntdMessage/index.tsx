import React, { useContext } from 'react';
import { message } from 'antd';
import { ConfigProviderProps } from 'antd/es/config-provider';
import { AntMessageContext } from './context';

interface IAntdLayoutProps {
  children: React.ReactNode;
  config?: ConfigProviderProps;
}

function AntdMessage(props: IAntdLayoutProps) {
  // message context 不共享，https://ant-design.antgroup.com/components/message-cn#为什么 message 不能获取 context、redux 的内容和 ConfigProvider 的 locale/prefixCls/theme 等配置？
  const [messageApi, contextHolder] = message.useMessage();
  return (
    <AntMessageContext.Provider
      value={{
        message: messageApi,
      }}
    >
      {contextHolder}
      {props.children}
    </AntMessageContext.Provider>
  );
}

export function useMessage() {
  const context = useContext(AntMessageContext);
  return context.message;
}

export default AntdMessage;
