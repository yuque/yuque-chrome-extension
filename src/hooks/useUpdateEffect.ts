import { useRef, useEffect, DependencyList } from 'react';

export const useUpdateEffect = (fn: VoidFunction, deps: DependencyList) => {
  const isMounted = useRef(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return fn?.();
    }
  }, deps);
};
