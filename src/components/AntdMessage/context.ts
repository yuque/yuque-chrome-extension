import { createContext } from 'react';
import { MessageInstance } from 'antd/es/message/interface';

export interface IAntMessageContext {
  message: MessageInstance | null;
}

export const AntMessageContext = createContext<IAntMessageContext>({
  message: null,
});
