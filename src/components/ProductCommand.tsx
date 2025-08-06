import { C } from "node_modules/react-router/dist/development/lib-C1JSsICm.d.mts";
import { CommandGroup, CommandItem } from "@/components/ui/command";
import { flattenedProduct, getCombinationName } from "@/lib/utils";
import { CategorizedProductList, PurchaseOrder } from "@/types";
import { formatCurrency } from "@/utils/formatters";
import { Control, useWatch } from "react-hook-form";
import ComboBox from "@/components/ComboBox";
import React, { Fragment } from "react";
import { CommandSeparator } from "cmdk";
import { Badge } from "./ui/badge";

function ProductCommandGroup({ options, onChange, setOpen }) {
  return options.map((item) => (
    <CommandGroup
      heading={item.categoryName}
      key={item.categoryName}
      color="red"
    >
      {item?.products?.map((item) => (
        <Fragment key={item.name}>
          <CommandItem
            keywords={[item.name]}
            value={String(item.id)}
            key={item.id}
            onSelect={(selected) => {
              onChange(selected);
              setOpen(false);
            }}
            className="flex justify-between"
          >
            {item.name}
          </CommandItem>
        </Fragment>
      ))}
    </CommandGroup>
  ));
}

const SelectedItem = ({ selected }) => {
  return (
    selected && (
      <div className="flex gap-2 items-center">
        <Badge className="text-[9px]">{selected.unit}</Badge>
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
  onChange,
}: {
  control: Control<PurchaseOrder>;
  list: CategorizedProductList[];
  value: number | string | undefined | null;
  onChange: (selected: string) => void;
  placeholder?: string;
}) {
  const [options, setOptions] = React.useState<CategorizedProductList[]>([]);
  const [open, setOpen] = React.useState(false);
  const fields = useWatch({
    control,
    name: `purchaseOrderItems`,
  });

  const flat = flattenedProduct(list);

  React.useEffect(() => {
    const exclude = fields
      .map((item) => Number(item.productId))
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

    setOptions(items);
  }, [fields, list]);

  const selected = flat.find((item) => item.combinationId === Number(value));

  return (
    <ComboBox
      setOpen={setOpen}
      onChange={onChange}
      open={open}
      selected={<SelectedItem selected={selected} />}
      value={value}
      placeholder="Type to search..."
      options={options}
    >
      {options.map((item) => (
        <>
          <CommandGroup
            heading={item.categoryName}
            key={item.categoryName}
            color="red"
          >
            <CommandSeparator />
            {item?.products?.map((item) => (
              <CommandGroup
                heading={item.name}
                value={String(item.id)}
                key={item.id}
              >
                {item.combinations.map((combination) => (
                  <CommandItem
                    keywords={[combination.sku]}
                    value={String(combination.id)}
                    key={combination.id}
                    onSelect={(selected) => {
                      onChange(selected);
                      setOpen(false);
                    }}
                    className="flex gap-2 items-center justify-between"
                  >
                    <div className="flex gap-2">
                      {combination.values.map((value) => {
                        return <span key={value.id}>{value.value}</span>;
                      })}
                    </div>
                    <span className="text-muted-foreground">
                      {formatCurrency(combination.price)}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandGroup>
        </>
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
