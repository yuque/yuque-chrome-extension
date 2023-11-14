import { BackgroundEvents } from '@/isomorphic/background';
import { MonitorAction } from '@/isomorphic/constant/monitor';
import { ICallBridgeImpl } from '../index';

export function createMonitorProxy(impl: ICallBridgeImpl) {
  return {
    // 这个埋点请求只用户注入插件内的，iframe 类走默认埋点
    biz(action: MonitorAction): Promise<{ result: string }> {
      return new Promise((resolve, rejected) => {
        impl(
          BackgroundEvents.OperateRequest,
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
            if (res.status === 200) {
              resolve(res?.data?.data);
              return;
            }
            rejected(res);
          },
        );
      });
    },
  };
}
