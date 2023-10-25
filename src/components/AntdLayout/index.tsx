import React from 'react';
import { ConfigProvider } from 'antd';

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
          colorBorder: '#EFEFEF',
          colorText: '#585A5A',
        },
      }}
    >
      {props.children}
    </ConfigProvider>
  );
}

export default AntdLayout;
