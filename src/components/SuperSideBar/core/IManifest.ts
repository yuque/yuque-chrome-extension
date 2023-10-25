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
   * 描述
   */
  description?: string;

  /**
   * Provider
   */
  Provider: BuiltinProvider;
}
