import { CategorizedProductList, ProductCombinations } from "@/types";
import { CommandGroup, CommandItem } from "@/components/ui/command";
import useExcludeExistToList from "@/hooks/useExcludeExists";
import { Control, FieldValues } from "react-hook-form";
import { formatCurrency } from "@/utils/formatters";
import { UNIT_COLOR } from "@/utils/definitions";
import ComboBox from "@/components/ComboBox";
import { useProductStore } from "@/stores";
import { CommandSeparator } from "cmdk";
import ColorBadge from "./ColorBadge";
import React from "react";

const defaultRenderOption = (
  combination: ProductCombinations,
  onChange: (value: string) => void,
) => {
  return (
    <CommandItem
      disabled={
        combination.inventory?.quantity === 0 ||
        combination.inventory?.quantity === undefined
      }
      keywords={[combination.sku ?? ""]}
      value={String(combination.id)}
      key={combination.id}
      onSelect={(v) => {
        onChange(v);
      }}
      className="flex gap-2 items-center justify-between"
    >
      <div className="flex gap-2 items-center">
        {combination.values.map((value) => {
          return <span key={value.id}>{value.value}</span>;
        })}
        {combination.inventory?.quantity !== undefined &&
          combination.inventory?.quantity > 0 && (
            <small className="text-muted-foreground">
              x{combination.inventory?.quantity}
            </small>
          )}
      </div>
      <span className="text-muted-foreground">
        {formatCurrency(combination.price)}
      </span>
    </CommandItem>
  );
};

export interface ProductCommandSelectedItemProps {
  combinationId?: number;
  productName: string;
  unit: string;
  price: number;
  variants: { variantType: string | undefined; value: string }[];
}

const SelectedItem = ({
  selected,
}: {
  selected: ProductCommandSelectedItemProps;
}) => {
  return (
    selected && (
      <div className="flex gap-2 items-center">
        <span>{selected.productName}</span>
        {selected.variants.map((v) => v.value).join(" | ")}
      </div>
    )
  );
};

export default function ProductCommand<T extends FieldValues>({
  control,
  list,
  value,
  field,
  onChange,
  renderOption = defaultRenderOption,
}: {
  control: Control<T>;
  list: CategorizedProductList[];
  value: string;
  field: string;
  onChange: (selected: string) => void;
  renderOption?: (
    combination: ProductCombinations,
    onChange: (value: string) => void,
  ) => React.ReactNode;
}) {
  // const [options, setOptions] = React.useState<CategorizedProductList[]>([]);
  const [open, setOpen] = React.useState(false);
  // const fields = useWatch({
  //   control,
  //   name: `purchaseOrderItems`,
  // });
  const { flatProducts } = useProductStore();

  // React.useEffect(() => {
  //   const exclude =
  //     fields &&
  //     fields.map((item) => Number(item.combinationId)).filter(Boolean);
  //   const items = list?.map((category) => {
  //     const products = category.products.map((product) => {
  //       return {
  //         ...product,
  //         combinations: product.combinations.filter((combination) => {
  //           return !exclude.includes(Number(combination.id));
  //         }),
  //       };
  //     });
  //     const productsWithCombo = products.filter(
  //       (p) => p.combinations.length > 0,
  //     );
  //     return products.length > 0
  //       ? { ...category, products: productsWithCombo }
  //       : null;
  //   });

  //   setOptions(items as CategorizedProductList[]);
  // }, [fields, list]);
  const options = useExcludeExistToList(list, control, field);

  const handleOnChange = (value: string) => {
    onChange(value);
    setOpen(false);
  };
  const selected: ProductCommandSelectedItemProps | undefined =
    flatProducts.find((item) => item.combinationId === Number(value));
  return (
    <ComboBox
      setOpen={setOpen}
      open={open}
      selected={selected ? <SelectedItem selected={selected} /> : null}
      value={value}
      placeholder="Select a product..."
    >
      {options.map((item) => (
        <CommandGroup
          heading={item.categoryName}
          key={item.categoryName}
          color="red"
        >
          <CommandSeparator />
          {item?.products?.map((product) => (
            <CommandGroup
              heading={
                <div className="flex gap-2 items-center">
                  {product.name}{" "}
                  <ColorBadge className="ml-auto" colorMap={UNIT_COLOR}>
                    {product.unit}
                  </ColorBadge>
                </div>
              }
              value={String(product.id)}
              key={product.id}
            >
              {product.combinations?.map((combination) =>
                renderOption(combination, handleOnChange),
              )}
            </CommandGroup>
          ))}
        </CommandGroup>
      ))}
      <CommandSeparator />
    </ComboBox>
  );
}
