import { createDocProxy } from './doc';
import { createMineProxy } from './mine';
import { createNoteProxy } from './note';
import { createTagProxy } from './tag';
import { createWordMarkProxy } from './wordMark';
import { createUploadProxy } from './upload';
import { ICallBridgeImpl } from '../index';
import { createMonitorProxy } from './monitor';

export function createRequestBridge(impl: ICallBridgeImpl) {
  return {
    request: {
      mine: createMineProxy(impl),
      tag: createTagProxy(impl),
      note: createNoteProxy(impl),
      doc: createDocProxy(impl),
      wordMark: createWordMarkProxy(impl),
      upload: createUploadProxy(impl),
      monitor: createMonitorProxy(impl),
    },
  };
}
