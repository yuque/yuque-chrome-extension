export interface MapT<T> {
  [key: string]: T;
}

export type VoidFunction = () => void;
export type OneArgFunction = (data?: any) => void;
export type OneArgFunctionT<T> = (data: T) => void;
