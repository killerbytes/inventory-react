import { CommandGroup, CommandItem } from "@/components/ui/command";
import { CategorizedProductList, GoodReceipt } from "@/types";
import { Control, useWatch } from "react-hook-form";
import ComboBox from "@/components/ComboBox";
import React, { Fragment } from "react";

function ProductCommandGroup({ options, onChange, setOpen }) {
  return options.map((item) => (
    <CommandGroup
      heading={item.categoryName}
      key={item.categoryName}
      color="red"
    >
      {item?.inventories?.map(({ product }) => (
        <Fragment key={product.name}>
          <CommandItem
            keywords={[product.name]}
            value={String(product.id)}
            key={product.id}
            onSelect={(selected) => {
              onChange(selected);
              setOpen(false);
            }}
            className="flex justify-between"
          >
            {product.name}
          </CommandItem>
        </Fragment>
      ))}
    </CommandGroup>
  ));
}

export default function ProductList({
  control,
  list,
  value,
  onChange,
}: {
  control: Control<GoodReceipt>;
  list: CategorizedProductList[];
  value: number | string | undefined | null;
  onChange: (selected: string) => void;
  placeholder?: string;
}) {
  const [options, setOptions] = React.useState<CategorizedProductList[]>([]);
  const [open, setOpen] = React.useState(false);
  const fields = useWatch({
    control,
    name: `salesOrderItems`,
  });

  React.useEffect(() => {
    const exclude = fields.map((item) => Number(item.productId));
    const items = list.map((item) => {
      const inventories = item.inventories.filter((product) => {
        return !exclude.includes(Number(product.id));
      });
      return { ...item, inventories };
    });

    setOptions(items);
  }, [fields, list]);

  const selected = list
    .map((option) => {
      const found = option.inventories.find(
        (inventory) => inventory.productId === Number(value),
      );
      return found ? found : null;
    })
    .filter(Boolean)[0]?.product.name;

  return (
    <ComboBox
      setOpen={setOpen}
      onChange={onChange}
      open={open}
      selected={selected}
      value={value}
      placeholder="Type to search..."
    >
      <ProductCommandGroup
        options={options}
        onChange={onChange}
        setOpen={setOpen}
      />
    </ComboBox>
  );
}
