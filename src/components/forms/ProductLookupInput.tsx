import ProductComboSearchCommand from "../ProductComboSearchCommand";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { getMappedSearchProductCombinations } from "@/lib/utils";
import useExcludeExistToList from "@/hooks/useExcludeExists";
import GroupedCommandList from "../GroupedCommandList";
import { ProductCombinations } from "@/schemas";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import React from "react";

export default function ProductLookupInput<T extends FieldValues>({
  form,
  onChange,
  index,
  name,
  ariaInvalid,
  disableNoQuantity,
  noBreakPacks = false,
  valueKey = "combinations",
}: {
  form: UseFormReturn<T>;
  onChange: (value: ProductCombinations) => void;
  index: number;
  name: Path<T>;
  ariaInvalid?: boolean;
  disableNoQuantity?: boolean;
  noBreakPacks?: boolean;
  valueKey?: string;
}) {
  const [items, setItems] = React.useState<ProductCombinations[]>([]);
  const onSearch = React.useCallback(
    async (search: string) => {
      const combinations = await getMappedSearchProductCombinations({
        search,
        ...(noBreakPacks && { noBreakPacks }),
      });
      setItems(combinations);
      return combinations;
    },
    [noBreakPacks],
  );

  const options = useExcludeExistToList(items, form?.control, name);
  return (
    <ProductComboSearchCommand
      onSearch={onSearch}
      onSelect={(value) => {
        // form.setValue(`${name}[${index}].combinations` as Path<T>, value);

        onChange(value);
      }}
      renderOptions={({ open, setOpen, onSelect, search }) => (
        <GroupedCommandList
          items={options}
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
        {form.getValues()[name][index]?.[valueKey]?.name}
        <ChevronsUpDown className="ml-auto" />
      </Button>
    </ProductComboSearchCommand>
  );
}
