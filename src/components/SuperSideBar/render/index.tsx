import React from 'react';
import {
  IBaseRenderOptions,
  IRenderDisableOptions,
  IRenderEmptyOptions,
  IRenderFrameOptions,
  IRenderInputOptions,
  IRenderNewTipsOptions,
  IRenderProgressOptions,
  IRenderResult,
  IRenderScrollerOptions,
  IRenderTextOptions,
  ISidebarGeneralRender,
} from '@/components/SuperSideBar/declare';
import { SingleLineInput } from './SingleLineInput';
import { NewTip } from './NewTip';
import { Scroller } from './Scroller';
import { MessageFrame } from './MessageFrame';
import { MessageText } from './MessageText';
import { MessageProgress } from './MessageProgress';

export const generalRender: ISidebarGeneralRender = {
  renderLoading(options?: IBaseRenderOptions): IRenderResult {
    return null;
  },

  renderEmpty(options?: IRenderEmptyOptions): IRenderResult {
    return null;
  },

  renderScroller(options: IRenderScrollerOptions): IRenderResult {
    return <Scroller {...options} />;
  },
  renderProgress(options: IRenderProgressOptions): IRenderResult {
    return <MessageProgress {...options} />;
  },

  renderFrame(options: IRenderFrameOptions): IRenderResult {
    return <MessageFrame {...options} />;
  },

  renderText(options: IRenderTextOptions): IRenderResult {
    return <MessageText {...options} />;
  },

  renderInput(options: IRenderInputOptions): IRenderResult {
    const { ref, ...rest } = options;
    return <SingleLineInput ref={ref} {...rest} />;
  },

  renderDisable(options: IRenderDisableOptions): IRenderResult {
    return null;
  },

  renderNewTip(options: IRenderNewTipsOptions): IRenderResult {
    return <NewTip {...options} />;
  },
};
