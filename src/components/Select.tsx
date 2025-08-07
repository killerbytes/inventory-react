import {
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cx } from "class-variance-authority";
import React, { SyntheticEvent } from "react";

interface SelectOption {
  [key: string]: string | number | null;
}

interface SelectProps {
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  className?: string;
  value?: string | number;
  name?: string;
  valueKey?: string;
  labelKey?: string;
}

function Select(props: SelectProps) {
  const {
    onChange,
    options,
    className,
    name,
    value,
    valueKey = "value",
    labelKey = "label",
  } = props;

  const [selectOptions, setSelectOptions] = React.useState<SelectOption[]>([]);

  React.useEffect(() => {
    setSelectOptions(options);
  }, [options]);

  const handleChange = (value: string) => {
    if (value) {
      const e = {
        target: {
          value: String(value),
          name,
        },
      } as unknown as React.ChangeEvent<HTMLSelectElement>;
      onChange(e);
    }
  };
  return (
    <SelectComponent
      {...props}
      value={String(value)}
      onValueChange={handleChange}
    >
      <SelectTrigger className={cx("w-full", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {selectOptions?.map((option) => (
          <SelectItem key={option[valueKey]} value={String(option[valueKey])}>
            {option[labelKey]}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectComponent>
  );
}

export default Select;
