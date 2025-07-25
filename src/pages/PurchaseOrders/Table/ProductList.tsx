import { Control, ControllerRenderProps, useWatch } from "react-hook-form";
import Autocomplete from "@/components/Autcomplete";
import { Product, PurchaseOrder } from "@/services";
import React from "react";

export default function ProductList({
  control,
  products,
  field,
}: {
  control: Control<PurchaseOrder>;
  products: Product[];
  field: ControllerRenderProps<PurchaseOrder>;
}) {
  const [options, setOptions] = React.useState<Product[]>([]);

  const fields = useWatch({
    control,
    name: `purchaseOrderItems`,
  });

  React.useEffect(() => {
    const exclude = fields.map((item) => item.productId);
    const items = exclude
      ? products.filter((p) => !exclude?.includes(p.id))
      : products;

    setOptions(items);
  }, [fields, products]);

  return (
    <Autocomplete
      value={products.find((p) => p.id === field.value)?.name || ""}
      onChange={field.onChange}
      options={options}
      valueKey="id"
      labelKey="name"
    />
  );
}
