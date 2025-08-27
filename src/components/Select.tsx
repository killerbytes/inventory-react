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

interface SelectProps {
  onChange: (value: string) => void;
  options: any[];
  className?: string;
  value?: string;
  valueKey?: string;
  labelKey?: string;
  tabIndex?: number;
  disabled?: boolean;
  renderOption?: (option: SelectOption) => React.ReactNode;
}

function defaultRenderOption(option: SelectOption) {
  return (
    <SelectItem key={option.value} value={String(option.value)}>
      {option.label}
    </SelectItem>
  );
}
function Select(props: SelectProps) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const {
    onChange,
    options,
    className,
    value,
    tabIndex,
    renderOption = defaultRenderOption,
  } = props;
  const [selectOptions, setSelectOptions] = React.useState<SelectOption[]>([]);
  React.useEffect(() => {
    triggerRef.current?.focus();
  }, []);

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
        className={cx("w-full", className)}
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
