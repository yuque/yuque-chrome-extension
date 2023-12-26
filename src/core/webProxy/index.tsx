import { createWordMarkProxy } from './wordMark';
import { createMineProxy } from './mine';
import { createMonitorProxy } from './monitor';
import { createNoteProxy } from './note';
import { createTagProxy } from './tag';
import { createDocProxy } from './doc';
import { createUploadProxy } from './upload';

export const webProxy = {
  mine: createMineProxy(),
  monitor: createMonitorProxy(),
  tag: createTagProxy(),
  note: createNoteProxy(),
  doc: createDocProxy(),
  upload: createUploadProxy(),
  wordMark: createWordMarkProxy(),
};
