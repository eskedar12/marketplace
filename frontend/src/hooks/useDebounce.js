import { useEffect, useState } from 'react';

// Delays updating the returned value until `value` has stopped
// changing for `delayMs`. Used on the search input so we don't fire
// an API call on every keystroke — only once the person pauses typing.
export function useDebounce(value, delayMs = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
