import {
  IDatasourceListener,
  SideContentDatasource,
} from '@/components/SuperSideBar/declare';

export interface IClipAssistantDatasourceListener extends IDatasourceListener {
  onConversationsUpdated?(): void;
}

export class ClipDataSource extends SideContentDatasource<IClipAssistantDatasourceListener> {}
