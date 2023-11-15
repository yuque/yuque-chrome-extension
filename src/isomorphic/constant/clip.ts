export type IClipConfig = {
  // 是否在文章底部加入链接
  addLink: boolean;
};

export type ClipConfigKey = keyof IClipConfig;

export const defaultClipConfig: IClipConfig = {
  addLink: true,
};
