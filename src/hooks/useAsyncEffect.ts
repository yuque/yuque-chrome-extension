import { DependencyList, useEffect } from 'react';

/**
 * React `useEffect()` with the effect's return value (effect cleanup function) ignored
 * @param asyncEffect
 * @param deps
 */

declare type AsyncEffectFunction = () => void;

export function useEffectAsync(
  asyncEffect: AsyncEffectFunction,
  deps: DependencyList,
): void {
  useEffect(() => {
    asyncEffect();
  }, deps);
}
