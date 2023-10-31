export enum ContentScriptEvents {
  ScreenOcr = 'contentScript/screenOcr',
  SelectArea = 'contentScript/selectArea',
  CollectLink = 'contentScript/collectLink',
  ToggleSidePanel = 'contentScript/toggleSidePanel',
  WordMarkConfigChange = 'contentScript/wordMarkConfigChange',
  LevitateConfigChange = 'contentScript/levitateConfigChange',
  AddContentToClipAssistant = 'contentScript/addContentToClipAssistant',
  ForceUpgradeVersion = 'contentScript/forceUpgradeVersion',
  LoginOut = 'contentScript/LoginOut',
}

export const ContentScriptMessageKey = 'ContentScriptMessageKey';

export enum ContentScriptMessageActions {
  ShowMessage = 'showMessage',
}

export interface IShowMessageData {
  type: 'error' | 'success';
  text: string;
  link?: {
    text: string;
    href: string;
  };
}
