import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { isEqual, pick } from 'lodash';
import useLatest from './useLatest';

const effect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const defaultValue = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  offsetHeight: 0,
  scrollHeight: 0,
  offsetWidth: 0,
  scrollWidth: 0,
};
type UseMeasureRef<E extends HTMLDivElement> = (element: E) => void;
type UseMeasureResult<E extends HTMLDivElement> = [
  UseMeasureRef<E>,
  typeof defaultValue,
];

/** 获取元素的尺寸等信息
 * const [ref, rect] = useMeasure();
 *
 * useEffect(() => {
 *  const 文本是否出现省略号... = rect.offsetWidth < rect.scrollWidth;
 * }, [rect])
 * <div ref={ref} />
 */
function useMeasure<E extends HTMLDivElement>(): UseMeasureResult<E> {
  const [el, ref] = useState<E | null>(null);
  const [rect, setRect] = useState<typeof defaultValue>(defaultValue);
  const latestRef = useLatest(el);

  const observer = useMemo(() => {
    return new window.ResizeObserver(entries => {
      if (entries[0]) {
        const contentRect = entries[0].contentRect;
        if (!isEqual(entries[0].contentRect, rect)) {
          setRect({
            ...pick(contentRect, ['x', 'y', 'width', 'height', 'top', 'left', 'bottom', 'right']),
            ...pick(latestRef.current as any, ['offsetHeight', 'scrollHeight', 'offsetWidth', 'scrollWidth']),
          });
        }
      }
    });
  }, []);

  effect(() => {
    if (!el || !Object.prototype.toString.call(el).slice(8, -1).includes('HTML')) return;
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [el]);

  return [ref, rect];
}

export default useMeasure;
