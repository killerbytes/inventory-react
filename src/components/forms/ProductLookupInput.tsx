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
}: {
  items: T[];
  form: UseFormReturn;
  onChange: (value: T) => void;
  value: number;
  name: string;
}) {
  const options = useExcludeExistToList(items, form?.control, name);
  return (
    <ProductComboSearchCommand
      items={options}
      onSelect={(item) => {
        onChange(item);
      }}
      name={name}
      form={form}
      renderOptions={(items, open, setOpen, onSelect) => {
        return (
          open &&
          items.map((item) => (
            <CommandGroup key={item.id}>
              <CommandItem
                value={String(item.name)}
                disabled={item.inventory.quantity < 1}
                key={item.id}
                onSelect={() => {
                  setOpen(false);
                  onSelect?.(item);
                }}
                className="flex items-center gap-2 justify-between"
              >
                {item.name}
                <div className="flex gap-2">
                  {item.inventory.quantity}
                  <span>{formatCurrency(item.price)}</span>
                  <ColorBadge colorMap={UNIT_COLOR}>{item.unit}</ColorBadge>
                </div>
              </CommandItem>
            </CommandGroup>
          ))
        );
      }}
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
