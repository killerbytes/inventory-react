import {
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cx } from "class-variance-authority";
import { SyntheticEvent } from "react";

interface SelectOption {
  [key: string]: string;
}

interface SelectProps {
  onChange: (e: SyntheticEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  className?: string;
  value?: string;
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
    valueKey = "value",
    labelKey = "label",
  } = props;

  const handleChange = (value: string) => {
    const e = {
      target: { value, name },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(e);
  };
  return (
    <SelectComponent {...props} onValueChange={handleChange}>
      <SelectTrigger className={cx("w-full", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option[valueKey]} value={option[valueKey]}>
            {option[labelKey]}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectComponent>
  );
}

export default Select;
