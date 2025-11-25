import ProductComboSearchCommand from "../ProductComboSearchCommand";
import useExcludeExistToList from "@/hooks/useExcludeExists";
import GroupedCommandList from "../GroupedCommandList";
import { UseFormReturn } from "react-hook-form";
import { ChevronsUpDown } from "lucide-react";
import { ProductCombinations } from "@/types";
import { Button } from "../ui/button";

export default function ProductLookupInput<T extends ProductCombinations>({
  items,
  form,
  onChange,
  value,
  name,
  ariaInvalid,
  disableNoQuantity,
}: {
  items: T[];
  form: UseFormReturn;
  onChange: (value: T) => void;
  value: number;
  name: string;
  ariaInvalid?: boolean;
  disableNoQuantity?: boolean;
}) {
  const options = useExcludeExistToList(items, form?.control, name);

  return (
    <ProductComboSearchCommand
      items={options}
      onSelect={(item) => {
        onChange(item);
      }}
      renderOptions={({ items, open, setOpen, onSelect, search }) => (
        <GroupedCommandList
          items={items}
          open={open}
          setOpen={setOpen}
          onSelect={onSelect}
          search={search}
          disableNoQuantity={disableNoQuantity}
        />
      )}
    >
      <Button
        variant="outline"
        className="w-full flex justify-between h-9 min-w-[200px]"
        type="button"
        aria-invalid={ariaInvalid}
      >
        {items.find((i) => i.id === value)?.name}
        <ChevronsUpDown className="ml-auto" />
      </Button>
    </ProductComboSearchCommand>
  );
}
