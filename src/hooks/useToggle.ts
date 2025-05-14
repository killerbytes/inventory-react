import React from "react";

interface ToggleState<T> {
  [key: string]: T;
}

type UseToggleResult<T> = [T, (item: Partial<ToggleState<T>>) => void] & {
  toggle: T;
  handleToggle: (item: Partial<ToggleState<T>>) => void;
};

export default function useToggle<T>(
  state: ToggleState<T>
): UseToggleResult<T> {
  const [toggle, setToggle] = React.useState<ToggleState<T>>(state);
  const handleToggle = React.useCallback((item: Partial<ToggleState<T>>) => {
    setToggle((prevState) => ({ ...prevState, ...item } as ToggleState<T>));
  }, []);

  const result = Object.assign([toggle, handleToggle], {
    toggle,
    handleToggle,
  }) as UseToggleResult<T>;
  result.toggle = result[0];
  result.handleToggle = result[1];

  return result;
}
