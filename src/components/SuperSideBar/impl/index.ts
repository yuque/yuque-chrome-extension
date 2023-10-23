import { pick } from 'lodash';
import { DataClipSidebarProvider } from '@/components/SuperSideBar/impl/ClipAssistant/provider';
import { AssistantType } from '@/components/SuperSideBar/declare';
import ClipAssistantSvg from '@/assets/svg/clip-assistant.svg';

export const builtinManifests = {
  [AssistantType.ClipAssistant]: {
    type: AssistantType.ClipAssistant,
    label: '剪藏助手',
    description: '',
    icon: ClipAssistantSvg,
    hasWatermark: true,
    disableUnpin: true,
    Provider: DataClipSidebarProvider,
    id: 1,
  },
};

export const defaultManifests = pick(builtinManifests, [
  AssistantType.ClipAssistant,
]);
