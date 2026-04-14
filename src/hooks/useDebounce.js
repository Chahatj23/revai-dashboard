import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * @param {any} value - The value to debounce.
 * @param {number} delay - The delay in milliseconds (default: 500ms).
 * @returns {any} - The debounced value.
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timer on value change or unmount
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
