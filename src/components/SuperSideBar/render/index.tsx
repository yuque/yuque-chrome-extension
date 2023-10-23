import {
  IBaseRenderOptions,
  IRenderDisableOptions,
  IRenderEmptyOptions,
  IRenderFrameOptions,
  IRenderInputOptions,
  IRenderProgressOptions,
  IRenderResult,
  IRenderScrollerOptions,
  IRenderTextOptions,
  ISidebarGeneralRender,
} from '@/components/SuperSideBar/declare';

export const generalRender: ISidebarGeneralRender = {
  renderLoading(options?: IBaseRenderOptions): IRenderResult {
    return null;
  },

  renderEmpty(options?: IRenderEmptyOptions): IRenderResult {
    return null;
  },

  renderScroller(options: IRenderScrollerOptions): IRenderResult {
    return null;
  },

  renderProgress(options: IRenderProgressOptions): IRenderResult {
    return null;
  },

  renderFrame(options: IRenderFrameOptions): IRenderResult {
    return null;
  },

  renderText(options: IRenderTextOptions): IRenderResult {
    return null;
  },

  renderInput(options: IRenderInputOptions): IRenderResult {
    return null;
  },
  renderDisable(options: IRenderDisableOptions): IRenderResult {
    return null;
  },
};
