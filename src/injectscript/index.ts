import { InjectScriptRequestKey, MessageEventRequestData } from '../isomorphic/injectScript';
import { YuqueService, CommonService } from './service';
import { BaseService } from './service/base';

class InjectScriptApp {
  private serviceMap: { [key: string]: BaseService } = {};

  constructor() {
    this.init();
  }

  init() {
    this.registerService(new YuqueService());
    this.registerService(new CommonService());
    window.addEventListener('message', async (e: MessageEvent<MessageEventRequestData>) => {
      if (e.data.key !== InjectScriptRequestKey) {
        return;
      }
      const { serviceMethod, serviceName, params } = e?.data?.data;
      const service = this.serviceMap[serviceName];
      try {
        const fn = (service as any)[serviceMethod];
        if (typeof fn !== 'function') {
          console.log(`inject script ${serviceName}.${serviceMethod} is not a function`, fn);
          return;
        }
        const result = await fn(params || {});
        service.callbackResponse(result, e.data.requestId);
      } catch (e: any) {
        console.log(`execute ${serviceName}.${serviceMethod} error`);
        service.callbackResponse({ error: e?.message }, e.data.requestId);
      }
    });
  }

  private registerService(service: BaseService) {
    if (this.serviceMap[service.name]) {
      console.log(`inject script service map has been register, service name is ${service.name}`);
      return;
    }
    if (!service.enableRegister()) {
      return;
    }
    console.log(`inject script register service success, service name is ${service.name}`);
    this.serviceMap[service.name] = service;
  }
}

new InjectScriptApp();
