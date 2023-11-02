export type ILevitateConfig = {
  disableUrl: Array<{
    origin: string;
    icon: string;
  }>;
  position: string;
  enable: boolean;
};

export type LevitateConfigKey = keyof ILevitateConfig;

export const defaultLevitateConfig: ILevitateConfig = {
  enable: true,
  disableUrl: [],
  position: '',
};
