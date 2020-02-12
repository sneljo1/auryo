import { useRef, useEffect } from 'react';

export const usePrevious = <T extends any>(value: T) => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
