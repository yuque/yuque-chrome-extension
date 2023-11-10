// eslint-disable-next-line max-classes-per-file
import { IUser } from '@/isomorphic/interface';
import React, { MutableRefObject } from 'react';

export type IMsg = {
  msgId: string;
  type: string;
  feedback?: number;
  content: string;
  completion_id: number;
  typewriter?: boolean;
  stream?: boolean;
  index?: number;
  docText?: string;
  docTitle?: string;
};

export interface IRootDrawerRef {
  render: (conf: RootRenderProps) => void;
  onClose: () => void;
}
export type RootRenderProps = {
  title: React.ReactElement;
  content: React.ReactElement;
};

export interface IScrollerRef {
  scrollToBottom(immediately?: boolean): void;
}

export type IListenerRemover = () => void;

export interface IMessageProgress {
  status?: number;
  icon?: IRenderResult;
  text: string;
}

export interface IBaseRenderOptions {
  ref?: React.MutableRefObject<any>;
  key?: string | any;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface IRenderEmptyOptions extends IBaseRenderOptions {
  text?: string;
}

export interface IRenderDisableOptions extends IBaseRenderOptions {
  title: string;
  desc?: (string | React.ReactElement)[];
}

export interface IRenderScrollerOptions extends IBaseRenderOptions {
  ref: React.MutableRefObject<IScrollerRef | undefined>;
}

export interface IRenderProgressOptions extends IBaseRenderOptions {
  progresses?: IMessageProgress[];
}

export interface IRenderFrameOptions extends IBaseRenderOptions {
  fromUser?: boolean;
  bottomExtra?: React.ReactNode;
}

export interface IRenderTextOptions extends IBaseRenderOptions {
  text?: string | (string | React.ReactNode)[];
  typewriter?: boolean;
}

export interface IRenderInputOptions extends IBaseRenderOptions {
  ref: React.MutableRefObject<any | undefined>;
  placeholder?: string;
  disabled?: boolean;
  onEnter: (text: string) => void;
  extra?: React.ReactNode;
}

export type IRenderResult = React.JSX.Element | React.ReactElement | null;

/**
 * 通用消息渲染器
 */
export interface ISidebarGeneralRender {
  /**
   * 渲染 Loading 状态卡片
   */
  renderLoading(options?: IBaseRenderOptions): IRenderResult;

  /**
   * 渲染空白页面
   */
  renderEmpty(options?: IRenderEmptyOptions): IRenderResult;

  /**
   * 渲染滚动区域
   */
  renderScroller(options: IRenderScrollerOptions): IRenderResult;

  /**
   * 渲染消息进程.
   */
  renderProgress(options: IRenderProgressOptions): IRenderResult;

  /**
   * 渲染消息外层框架
   */
  renderFrame(options: IRenderFrameOptions): IRenderResult;

  /**
   * 渲染纯文本消息
   */
  renderText(options: IRenderTextOptions): IRenderResult;

  /**
   * 渲染输入框
   */
  renderInput(options: IRenderInputOptions): IRenderResult;

  /**
   * 不可用的时候的渲染
   */
  renderDisable(options?: IRenderDisableOptions): IRenderResult;

  /**
   * 渲染新用户提示
   */
  renderNewTip(options?: IRenderNewTipsOptions): IRenderResult;
}

export interface ISidebarRenderContext {
  contextData: ISidebarContextData;

  sidebarRender: ISidebarGeneralRender;

  forceUpdate(): void;

  scrollToBottom(immediately?: boolean): void;

  renderDrawer: IRootDrawerRef['render'];
  closeDrawer(): void;
}

export interface ISidebarContextData {
  me?: IUser;
}

/**
 * 侧边栏内容提供接口
 */
export interface ISideContentProvider {
  /**
   * 是否可用
   */
  isEnable?(contextData: ISidebarContextData): boolean;

  /**
   * 初始化 provider
   */
  initialize(contextData: ISidebarContextData): void;

  /**
   * 处理数据变化
   */
  onContextDataChanged?(contextData: ISidebarContextData): void;

  /**
   * 销毁 provider
   */
  destroy?(): void;

  /**
   * 渲染内容区域
   */
  renderContent?(context: ISidebarRenderContext): React.ReactNode | null;

  /**
   * 渲染底部区域
   */
  renderFooter?(context: ISidebarRenderContext): React.ReactNode | null;

  /**
   * 渲染额外区域
   */
  renderExtra?(context: ISidebarRenderContext): React.ReactNode | null;

  /**
   * 当不可用时的渲染
   */
  renderDisable?(context: ISidebarRenderContext): React.ReactNode | null;

  /**
   * 全接管的渲染. 全接管模式下, header/content/footer 均需自己负责编排
   */
  fullyCustomizedRender?(
    context: ISidebarRenderContext,
    scrollerRef: MutableRefObject<IScrollerRef>,
  ): React.ReactNode | null;
}

/**
 * 侧边栏内容提供者实现
 */
export abstract class SideContentProvider implements ISideContentProvider {
  /**
   * 是否可用
   */
  abstract isEnable(data: ISidebarContextData): boolean;

  /**
   * 初始化 provider
   */
  abstract initialize(contextData: ISidebarContextData): void;

  /**
   * 处理数据变化
   */
  onContextDataChanged?(contextData: ISidebarContextData): void;

  /**
   * 销毁 provider
   */
  destroy?(): void;

  /**
   * 渲染内容区域
   */
  renderContent?(context: ISidebarRenderContext): React.ReactNode | null;

  /**
   * 渲染底部区域
   */
  renderFooter?(context: ISidebarRenderContext): React.ReactNode | null;

  /**
   * 渲染额外区域
   */
  renderExtra?(context: ISidebarRenderContext): React.ReactNode | null;

  /**
   * 全接管的渲染. 全接管模式下, header/content/footer 均需自己负责编排
   */
  fullyCustomizedRender?(
    context: ISidebarRenderContext,
    scrollerRef: MutableRefObject<IScrollerRef>,
  ): React.ReactNode | null;
}

export interface IDatasetUpdatedParams {
  [key: string]: any;
  /** 更新后是否需要滚动 */
  needScroll?: boolean;
  /** 是否立即触发滚动到底部 */
  scrollImmediately?: boolean;
}

export interface IDatasourceListener {
  onDatasetUpdated?(params?: IDatasetUpdatedParams): void;
}

/**
 * 侧边栏内容提供者 datasource
 */
export abstract class SideContentDatasource<
  T extends IDatasourceListener = IDatasourceListener,
> {
  protected _listeners: T[] = [];

  addListener(listener: T): IListenerRemover {
    this._listeners.push(listener);
    return () => this.removeListener(listener);
  }

  removeListener(listener: T) {
    this._listeners = this._listeners.filter(it => it !== listener);
  }

  protected notifyListener(invoker: (listener: T) => void) {
    this._listeners.forEach(invoker);
  }

  protected notifyDatasetUpdated(params?: IDatasetUpdatedParams) {
    this.notifyListener(listener => listener.onDatasetUpdated?.(params));
  }
}

/**
 * 带 datasource 的侧边栏内容提供者实现
 */
export abstract class SideContentProviderWithDatasource<
  T extends SideContentDatasource<IDatasourceListener>,
> extends SideContentProvider {
  /**
   * 数据源
   */
  protected readonly _datasource: T;

  constructor() {
    super();
    this._datasource = this.createDatasource();
  }

  get datasource(): T {
    return this._datasource;
  }

  protected abstract createDatasource(): T;
}

export enum AssistantType {
  /**
   * 笔记
   */
  ClipAssistant = 'ClipAssistant',
}

export interface IAssistant<
  T extends ISideContentProvider = ISideContentProvider,
> {
  id: number;
  type: AssistantType;
  label: string;
  description?: string;
  icon: React.ReactNode;
  priority: string;
  hasWatermark?: boolean;
  provider: T;
}

export interface IRenderNewTipsOptions extends IBaseRenderOptions {
  img?: string;
  data: Array<{
    title: string;
    desc: Array<string>;
  }>;
}
