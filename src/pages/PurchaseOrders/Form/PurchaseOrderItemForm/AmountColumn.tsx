import { formatCurrency } from "@/utils/formatters";
import { Control, useWatch } from "react-hook-form";
import { PurchaseOrder } from "@/types";
import React from "react";

export default function AmountColumn({
  index,
  control,
}: {
  index: number;
  control: Control<PurchaseOrder>;
}) {
  const [value, setValue] = React.useState(0);
  const quantity = useWatch({
    control,
    name: `purchaseOrderItems.${index}.quantity`,
  });
  const price = useWatch({
    control,
    name: `purchaseOrderItems.${index}.purchasePrice`,
  });

  React.useEffect(() => {
    const q = Number(quantity) || 0;
    const p = Number(price) || 0;
    setValue(q * p);
  }, [quantity, price, index, setValue]);

  return formatCurrency(value);
}
