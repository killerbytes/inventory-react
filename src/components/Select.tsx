import {
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cx } from "class-variance-authority";
import React from "react";

interface SelectOption {
  [key: string]: string | number | null;
}

interface SelectProps<SelectOption> {
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  value?: string;
  valueKey?: string;
  labelKey?: string;
  tabIndex?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  renderOption?: (option: SelectOption) => React.ReactNode;
}

function defaultRenderOption(option: SelectOption) {
  return (
    <SelectItem key={option.value} value={String(option.value)}>
      {option.label}
    </SelectItem>
  );
}
function Select<T>(props: SelectProps<T>) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const {
    onChange,
    options,
    className,
    value,
    tabIndex,
    autoFocus = false,
    renderOption = defaultRenderOption as (option: T) => React.ReactNode,
  } = props;
  const [selectOptions, setSelectOptions] = React.useState<T[]>([]);
  React.useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        triggerRef.current?.focus();
      }, 0);
    }
  }, [autoFocus]);

  React.useEffect(() => {
    setSelectOptions(options);
  }, [options]);

  const handleChange = (value: string) => {
    if (value) {
      onChange(value);
    }
  };
  return (
    <SelectComponent
      {...props}
      value={value || ""}
      onValueChange={handleChange}
    >
      <SelectTrigger
        className={cx("w-full bg-background", className)}
        ref={triggerRef}
        tabIndex={tabIndex}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {selectOptions?.map((option) => renderOption(option))}
      </SelectContent>
    </SelectComponent>
  );
}

export default Select;
