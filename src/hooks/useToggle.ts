import React from "react";

interface ToggleState<> {
  [key: string]: boolean;
}

type UseToggleResult = [ToggleState, (item: Partial<ToggleState>) => void] & {
  toggle: ToggleState;
  handleToggle: (item: Partial<ToggleState>) => void;
};

export default function useToggle(state: ToggleState): UseToggleResult {
  const [toggle, setToggle] = React.useState<ToggleState>(state);
  const handleToggle = React.useCallback((item: Partial<ToggleState>) => {
    setToggle((prevState) => ({ ...prevState, ...item } as ToggleState));
  }, []);

  const result = Object.assign([toggle, handleToggle], {
    toggle,
    handleToggle,
  }) as UseToggleResult;
  result.toggle = result[0];
  result.handleToggle = result[1];

  return result;
}
