import { createContext } from 'react';
import { InjectAppType } from '@/isomorphic/constants';
import { IWordMarkConfig } from '@/isomorphic/word-mark';
import { IEditorRef } from '@/pages/inject-app/page/editor';


export interface IInjectAppContext {
  injectAppType: InjectAppType;
  wordMarkConfig: IWordMarkConfig;
  defaultClipType: string;
  editorRef: React.MutableRefObject<IEditorRef>;
  updateInjectAppType: (type: InjectAppType) => void;
  updateWordMarkConfig: (config: IWordMarkConfig) => void;
  startSelect: () => void;
}

export const InjectAppContext = createContext<IInjectAppContext>(null);
