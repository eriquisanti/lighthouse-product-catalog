import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayInMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delayInMs);
    return () => clearTimeout(timeoutId);
  }, [value, delayInMs]);

  return debouncedValue;
}
