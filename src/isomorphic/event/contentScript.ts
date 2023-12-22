export enum ContentScriptEvents {
  WordMarkConfigChange = 'contentScript/wordMarkConfigChange',
  LevitateConfigChange = 'contentScript/levitateConfigChange',
  ForceUpgradeVersion = 'contentScript/forceUpgradeVersion',
  LoginOut = 'contentScript/LoginOut',
  GetDocument = 'contentScript/getDocument',
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
