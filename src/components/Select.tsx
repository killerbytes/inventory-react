import {
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Select<T extends { value: string; label: string }>({
  onChange,
  options,
  value,
}: {
  onChange: (value: string) => void;
  options: T[];
  value: string;
}) {
  return (
    <SelectComponent defaultValue={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
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
