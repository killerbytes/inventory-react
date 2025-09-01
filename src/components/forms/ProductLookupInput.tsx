import ProductComboSearchCommand from "../ProductComboSearchCommand";
import useExcludeExistToList from "@/hooks/useExcludeExists";
import { CommandGroup, CommandItem } from "../ui/command";
import { formatCurrency } from "@/utils/formatters";
import { UNIT_COLOR } from "@/utils/definitions";
import { UseFormReturn } from "react-hook-form";
import { ChevronsUpDown } from "lucide-react";
import ColorBadge from "../ColorBadge";
import { Button } from "../ui/button";

export default function ProductLookupInput<
  T extends {
    id: number;
    name: string;
    price: number;
    unit: string;
    inventory: { quantity: number };
  },
>({
  items,
  form,
  onChange,
  value,
  name,
  renderOptions,
}: {
  items: T[];
  form: UseFormReturn;
  onChange: (value: T) => void;
  value: number;
  name: string;
  renderOptions?: (
    items: T[],
    open: boolean,
    setOpen: (open: boolean) => void,
    onSelect?: (item: T) => void,
  ) => React.ReactNode;
}) {
  const options = useExcludeExistToList(items, form?.control, name);
  return (
    <ProductComboSearchCommand
      items={options}
      onSelect={(item) => {
        onChange(item);
      }}
      name={name}
      renderOptions={renderOptions}
    >
      <Button
        variant="outline"
        className="w-full flex justify-between h-9 min-w-[200px]"
        type="button"
      >
        {items.find((i) => i.id === value)?.name}
        <ChevronsUpDown className="ml-auto" />
      </Button>
    </ProductComboSearchCommand>
  );
}
