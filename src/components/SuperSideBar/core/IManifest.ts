import React from 'react';
import { AssistantType, ISideContentProvider } from '../declare';

type BuiltinProvider = new () => ISideContentProvider;

export interface IManifest {
  /**
   * 类型
   */
  type: AssistantType;

  /**
   * 名称
   */
  label: string;

  /**
   * 图标
   */
  icon: React.ReactNode | string;

  /**
   * 是否需要安全水印
   */
  hasWatermark?: boolean;

  /**
   * 描述
   */
  description?: string;

  /**
   * 是否可以取消 pin，目前第一方中只有表格助手可以取消，其他的第一方的都不能，二方以及知识库和团队的都能取消
   */
  disableUnpin?: boolean;

  /**
   * Provider
   */
  Provider: BuiltinProvider;
}
