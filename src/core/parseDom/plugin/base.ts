export abstract class BasePlugin {
  public abstract parse(cloneDom: Element): Promise<void> | void;
}
