import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SelectComponent<T extends { value: string; label: string }>({
  onChange,
  options,
}: {
  onChange: () => { value: string; label: string };
  options: T[];
}) {
  return (
    <Select defaultValue="ALL" onValueChange={onChange}>
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
    </Select>
  );
}

export default SelectComponent;
