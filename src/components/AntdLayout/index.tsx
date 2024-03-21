import React from 'react';
import { ConfigProvider } from 'antd';
import { ConfigProviderProps } from 'antd/es/config-provider';
import { SidePanelZIndex } from '@/config';

interface IAntdLayoutProps {
  children: React.ReactNode;
  config?: ConfigProviderProps;
}

function AntdLayout(props: IAntdLayoutProps) {
  return (
    <ConfigProvider
      prefixCls="yuque-chrome-extension"
      theme={{
        token: {
          colorPrimary: '#00B96B',
          colorBorder: '#EFEFEF',
          colorText: '#585A5A',
        },
        components: {
          Select: {
            optionSelectedBg: '#EFF0F0',
          },
          Tooltip: {
            colorBgSpotlight: 'rgba(0, 0, 0, 0.75)',
            fontSize: 12,
          },
          Message: {
            zIndexPopup: SidePanelZIndex,
          },
        },
      }}
      {...props.config}
    >
      {props.children}
    </ConfigProvider>
  );
}

export default AntdLayout;
