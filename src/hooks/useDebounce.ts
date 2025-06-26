import React from "react";

// Debounce utility hook
export default function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value]);
  return debounced;
}
