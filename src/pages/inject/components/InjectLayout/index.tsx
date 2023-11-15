import React, { useContext } from 'react';
import { Modal, message } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';
import AntdLayout from '@/components/AntdLayout';
import { MessageInstance } from 'antd/es/message/interface';
import { HookAPI } from 'antd/es/modal/useModal';
import { InjectLayoutContext } from './context';
import '@/styles/global.less';

interface IInjectLayoutProps {
  children: React.ReactNode;
}

function InjectLayout(props: IInjectLayoutProps) {
  // message context 不共享，https://ant-design.antgroup.com/components/message-cn#为什么 message 不能获取 context、redux 的内容和 ConfigProvider 的 locale/prefixCls/theme 等配置？
  const [messageApi, messageContextHolder] = message.useMessage();
  const [modalApi, modalContextHolder] = Modal.useModal();
  return (
    <StyleProvider container={window._yuque_ext_app.shadowRoot}>
      <AntdLayout
        config={{
          getPopupContainer: () => window._yuque_ext_app.rootContainer,
        }}
      >
        <InjectLayoutContext.Provider
          value={{
            message: messageApi,
            Modal: modalApi,
          }}
        >
          {messageContextHolder}
          {modalContextHolder}
          {props.children}
        </InjectLayoutContext.Provider>
      </AntdLayout>
    </StyleProvider>
  );
}

export function useInjectContent() {
  const context = useContext(InjectLayoutContext);
  return context as {
    message: MessageInstance;
    Modal: HookAPI;
  };
}

export default InjectLayout;
