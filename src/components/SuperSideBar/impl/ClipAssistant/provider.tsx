import React from 'react';
import {
  SideContentProviderWithDatasource,
  type ISidebarContextData,
  type ISidebarRenderContext,
  IScrollerRef,
} from '@/components/SuperSideBar/declare';
import ClipAssistant from './index';
import { ClipDataSource } from './datasource';

/**
 * 数据表助手
 */
export class DataClipSidebarProvider extends SideContentProviderWithDatasource<ClipDataSource> {
  protected createDatasource(): ClipDataSource {
    return new ClipDataSource();
  }

  isEnable(_: ISidebarContextData): boolean {
    return true;
  }

  initialize(contextData: ISidebarContextData): void {
    // ignore
  }

  destroy() {
    // ignore
  }

  onContextDataChanged(contextData: ISidebarContextData) {
    // ignore
  }

  fullyCustomizedRender(
    context: ISidebarRenderContext,
    scrollerRef: React.MutableRefObject<IScrollerRef>,
  ): React.ReactNode {
    return <ClipAssistant />;
  }
}
