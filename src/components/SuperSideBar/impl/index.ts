import { pick } from 'lodash';
import { __i18n } from '@/isomorphic/i18n';
import { DataClipSidebarProvider } from '@/components/SuperSideBar/impl/ClipAssistant/provider';
import { AssistantType } from '@/components/SuperSideBar/declare';
import ClipAssistantSvg from '@/assets/svg/clip-assistant.svg';

export const builtinManifests = {
  [AssistantType.ClipAssistant]: {
    type: AssistantType.ClipAssistant,
    label: __i18n('笔记'),
    description: '',
    icon: ClipAssistantSvg,
    disableUnpin: true,
    Provider: DataClipSidebarProvider,
    id: 1,
  },
};

export const defaultManifests = pick(builtinManifests, [
  AssistantType.ClipAssistant,
]);
