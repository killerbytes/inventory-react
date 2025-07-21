import {
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cx } from "class-variance-authority";

function Select<T extends { value: string; label: string }>({
  onChange,
  options,
  value,
  className,
}: {
  onChange: (value: string) => void;
  options: T[];
  value: string;
  className?: string;
}) {
  return (
    <SelectComponent defaultValue={value} onValueChange={onChange}>
      <SelectTrigger className={cx("w-full", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectComponent>
  );
}

export default Select;
