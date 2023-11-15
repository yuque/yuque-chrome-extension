import { createContext } from 'react';
import { MessageInstance } from 'antd/es/message/interface';
import { HookAPI } from 'antd/es/modal/useModal';

export interface IInjectLayoutContext {
  message: MessageInstance | null;
  Modal: HookAPI | null;
}

export const InjectLayoutContext = createContext<IInjectLayoutContext>({
  message: null,
  Modal: null,
});
