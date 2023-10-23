import { IManifest } from './IManifest';

export interface IAssistantManifest extends IManifest {
  /**
   * id
   */
  id: number;

  /**
   * 排序优先级
   * https://github.com/rocicorp/fractional-indexing/tree/main
   */
  priority: string;
}
