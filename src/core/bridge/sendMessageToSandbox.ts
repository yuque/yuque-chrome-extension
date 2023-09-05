import { YQ_SANDBOX_BOARD_IFRAME } from "@/isomorphic/constants";
import { SandBoxMessageKey, SandBoxMessageType } from "@/isomorphic/sandbox";
import { destroyWordMark } from "@/pages/inject/word-mark";

export const sendMessageToSandBox = (action: SandBoxMessageType, data?: any) => {
  const iframe =  document.querySelector(`#${YQ_SANDBOX_BOARD_IFRAME}`) as HTMLIFrameElement;
  if (!iframe) {
    return;
  }
  iframe.classList.add('show');
  iframe?.contentWindow?.postMessage({
    key: SandBoxMessageKey,
    action,
    data: data || {},
  }, '*');
  destroyWordMark();
}
