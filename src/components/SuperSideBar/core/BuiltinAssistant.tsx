import { ReactNode, isValidElement } from 'react';
import { builtinManifests } from '@/components/SuperSideBar/impl';
import {
  AssistantType,
  IAssistant,
  ISideContentProvider,
} from '@/components/SuperSideBar/declare';
import { IAssistantManifest } from './IAssistantManifest';

export class BuiltinAssistant implements IAssistant {
  id: number;

  type: AssistantType;

  label: string;

  description?: string;

  icon: ReactNode;

  priority: string;

  provider: ISideContentProvider;

  constructor(manifest: IAssistantManifest) {
    const builtinManifest = builtinManifests[manifest.type];

    this.id = manifest.id;
    this.priority = manifest.priority;
    this.type = manifest.type;
    this.label = this.getLabel(manifest.label) || builtinManifest.label;
    this.description = manifest.description || builtinManifest.description;
    this.icon = this.getIconNode(manifest.icon) || builtinManifest.icon;
    const Provider = manifest.Provider || builtinManifest.Provider;
    this.provider = new Provider();
  }

  getIconNode(icon: ReactNode | string) {
    if (isValidElement(icon)) {
      return icon;
    }

    if (typeof icon !== 'string') {
      return null;
    }

    return icon;
  }

  getLabel(label: string) {
    return label;
  }
}
