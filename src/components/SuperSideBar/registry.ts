import {
  defaultManifests,
} from '@/components/SuperSideBar/impl/index';
import { superSidebar } from '@/components/SuperSideBar';
import { BuiltinAssistant } from './core/BuiltinAssistant';
import { IAssistantManifest } from './core/IAssistantManifest';

export async function registerAssistantsToSidebar() {
  const initManifests = Object.values(defaultManifests);

  initManifests.forEach(manifest => {
    superSidebar.addAssistant(
      new BuiltinAssistant(manifest as unknown as IAssistantManifest),
    );
  });
}
