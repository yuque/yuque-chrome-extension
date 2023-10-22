import { ConfigProvider } from 'antd';
import React from 'react';

interface IAntdLayoutProps {
  children: React.ReactNode;
}

function AntdLayout(props: IAntdLayoutProps) {
  return (
    <ConfigProvider
      prefixCls='yuque-chrome-extension'
      theme={{
        token: {
          colorPrimary: '#00B96B',
        },
      }}
    >
      {props.children}
    </ConfigProvider>
  );
}

export default AntdLayout;
