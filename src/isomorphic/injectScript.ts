export const InjectScriptRequestKey = 'inject-script-request-key';
export const InjectScriptResponseKey = 'inject-script-response-key';

export interface MessageEventRequestData {
  key: string;
  requestId: string;
  data: {
    serviceName: string;
    serviceMethod: string;
    params?: { [key: string]: any };
  };
}

export interface MessageEventResponseData {
  key: string;
  requestId: string;
  data: {
    result: any;
    error?: any;
  };
}
