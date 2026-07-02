import GroupedCommandList, { BaseProps } from "../GroupedCommandList";
import ProductComboSearchCommand from "../ProductComboSearchCommand";
import { getMappedSearchProductCombinations } from "@/lib/utils";
import useExcludeExistToList from "@/hooks/useExcludeExists";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import React from "react";

export type { BaseProps };

export default function ProductLookupInput<T extends BaseProps>({
  onChange,
  ariaInvalid,
  exclude,
  disableNoQuantity,
  noBreakPacks = false,
  valueKey = "id",
  labelKey = "name",
  selected,
  renderOptions = ({ props, options, selectedId }) => (
    <GroupedCommandList
      {...props}
      items={options}
      disableNoQuantity={disableNoQuantity}
      selectedId={selectedId ? Number(selectedId) : -1}
    />
  ),
}: {
  onChange: (value: T) => void;
  ariaInvalid?: boolean;
  exclude?: number[];
  disableNoQuantity?: boolean;
  noBreakPacks?: boolean;
  valueKey?: string;
  labelKey?: string;
  selected?: any;
  renderOptions?: ({
    props,
    options,
    selectedId,
  }: {
    props: Parameters<typeof GroupedCommandList>[0];
    options: T[];
    selectedId: number;
  }) => React.ReactNode;
}) {
  const defaultOnSearch = React.useCallback(
    async (search: string) => {
      const combinations = await getMappedSearchProductCombinations({
        search,
        ...(noBreakPacks && { noBreakPacks }),
      });
      return combinations as unknown as T[];
    },
    [noBreakPacks],
  );

  const [items, setItems] = React.useState<T[]>([]);
  const onSearch = React.useCallback(
    async (search: string) => {
      const results = await defaultOnSearch(search);
      setItems(results);
      return results;
    },
    [defaultOnSearch],
  );

  const options = useExcludeExistToList(items, exclude);
  const selectedId = selected?.[valueKey];

  return (
    <ProductComboSearchCommand<T>
      onSearch={onSearch}
      onSelect={onChange}
      renderOptions={(props) =>
        renderOptions({
          props: props as unknown as Parameters<typeof GroupedCommandList>[0],
          options,
          selectedId,
        })
      }
    >
      <Button
        variant="outline"
        className="w-full flex justify-between h-9 min-w-[200px]"
        type="button"
        aria-invalid={ariaInvalid}
      >
        {selected?.[labelKey] ? String(selected?.[labelKey]) : null}
        <ChevronsUpDown className="ml-auto" />
      </Button>
    </ProductComboSearchCommand>
  );
}
