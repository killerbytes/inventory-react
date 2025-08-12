import { Control, UseFormSetValue, useWatch } from "react-hook-form";
import { CommandGroup, CommandItem } from "@/components/ui/command";
import { CategorizedProductList, PurchaseOrder } from "@/types";
import { formatCurrency } from "@/utils/formatters";
import ComboBox from "@/components/ComboBox";
import { useProductStore } from "@/stores";
import { CommandSeparator } from "cmdk";
import UnitBadge from "./UnitBadge";
import { Badge } from "./ui/badge";
import React from "react";

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

export default function ProductCommand({
  control,
  list,
  value,
  index,
  onChange,
  // setValue,
}: {
  control: Control<PurchaseOrder>;
  list: CategorizedProductList[];
  value: string;
  placeholder?: string;
  index: number;
  onChange: (selected: string) => void;
  // setValue: UseFormSetValue<PurchaseOrder>;
}) {
  const [options, setOptions] = React.useState<CategorizedProductList[]>([]);
  const [open, setOpen] = React.useState(false);
  const fields = useWatch({
    control,
    name: `purchaseOrderItems`,
  });

  const { flatProducts } = useProductStore();

  React.useEffect(() => {
    const exclude = fields
      .map((item) => Number(item.combinationId))
      .filter(Boolean);
    const items = list.map((category) => {
      const products = category.products.map((product) => {
        return {
          ...product,
          combinations: product.combinations.filter((combination) => {
            return !exclude.includes(Number(combination.id));
          }),
        };
      });
      const productsWithCombo = products.filter(
        (p) => p.combinations.length > 0,
      );
      return products.length > 0
        ? { ...category, products: productsWithCombo }
        : null;
    });

    setOptions(items as CategorizedProductList[]);
  }, [fields, list]);

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
                  <UnitBadge className="ml-auto">{product.unit}</UnitBadge>
                </div>
              }
              value={String(product.id)}
              key={product.id}
            >
              {product.combinations?.map((combination) => (
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
                    // const selected = flatProducts.find(
                    //   (item) => item.combinationId === Number(v),
                    // );
                    // setValue(
                    //   `purchaseOrderItems.${index}.unitPrice`,
                    //   Number(selected?.price),
                    // );
                    setOpen(false);
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
              ))}
            </CommandGroup>
          ))}
        </CommandGroup>
      ))}
      <CommandSeparator />

      {/* <ProductCommandGroup
        options={options}
        onChange={onChange}
        setOpen={setOpen}
      /> */}
    </ComboBox>
  );
}
