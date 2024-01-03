export enum ExtensionMessageListener {
  // 调用 background 的 http service
  callRequestService = 'callHttpService',

  // 调用 background 的 http 的回调函数
  callRequestServiceCallback = 'callHttpServiceCallback',

  // pageEvent
  pageEvent = 'pageEvent',
}
