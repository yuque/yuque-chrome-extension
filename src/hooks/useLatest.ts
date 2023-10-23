import { useRef } from 'react';

function useLatest<T>(value: T) {
  const ref = useRef(value);
  // 每次 function component 重新执行的时候，都会追踪最新的值
  ref.current = value;
  return ref;
}

export default useLatest;
