import { MonitorAction } from '@/isomorphic/constant/monitor';
import { httpProxy } from './base';

export function createMonitorProxy() {
  return {
    // 这个埋点请求只用户注入插件内的，iframe 类走默认埋点
    async biz(action: MonitorAction) {
      return new Promise(resolve => {
        httpProxy.sendMethodCallToBackground(
          {
            url: '/api/chrome_extension/logs/action',
            config: {
              method: 'POST',
              data: {
                action,
                pageUrl: window.location.href,
              },
            },
          },
          res => {
            resolve(res);
            return;
          },
        );
      });
    },
  };
}
