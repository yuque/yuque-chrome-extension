export type LevitateConfigKey = 'enable' | 'disableUrl' | 'position';

export interface ILevitateConfig {
  disableUrl: Array<{
    origin: string;
    icon: string;
  }>;
  position: string;
  enable: boolean;
}

export const defaultLevitateConfig: ILevitateConfig = {
  enable: true,
  disableUrl: [],
  position: '',
};
