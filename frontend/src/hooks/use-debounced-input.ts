import { useEffect, useRef, useState } from 'react';

const DEFAULT_DELAY_IN_MS = 300;

export function useDebouncedInput(
  value: string,
  onCommit: (value: string) => void,
  delayInMs = DEFAULT_DELAY_IN_MS,
) {
  const [inputValue, setInputValue] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  if (value !== syncedValue) {
    setSyncedValue(value);
    setInputValue(value);
  }

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  function handleChange(nextValue: string) {
    setInputValue(nextValue);
    clearTimeout(timeoutRef.current);

    const delay = nextValue.trim() ? delayInMs : 0;
    timeoutRef.current = setTimeout(() => onCommit(nextValue), delay);
  }

  function reset() {
    clearTimeout(timeoutRef.current);
    setInputValue('');
  }

  return [inputValue, handleChange, reset] as const;
}
