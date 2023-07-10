import { createContext, Dispatch, SetStateAction } from 'react';

export interface EditorValueContextType {
  currentType: string;
  editorValue: any[];
  setEditorValue: Dispatch<SetStateAction<any[]>>;
  setCurrentType: Dispatch<SetStateAction<string>>;
}

export const EditorValueContext = createContext<EditorValueContextType>({
  currentType: null,
  editorValue: [],
  setEditorValue: () => {},
  setCurrentType: () => {},
});
