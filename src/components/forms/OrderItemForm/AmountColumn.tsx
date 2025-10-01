import { Control, Path, useController } from "react-hook-form";
import { formatCurrency } from "@/utils/formatters";
import React from "react";

import { FieldValues } from "react-hook-form";

export default function AmountColumn<T extends FieldValues>({
  index,
  name,
  control,
}: {
  index: number;
  control: Control<T>;
  name: Path<T>;
}) {
  const [value, setValue] = React.useState(0);
  const quantity = useController({
    name: `${name}.${index}.quantity` as Path<T>,
    control,
  });
  const discount = useController({
    name: `${name}.${index}.discount` as Path<T>,
    control,
  });
  const purchasePrice = useController({
    name: `${name}.${index}.purchasePrice` as Path<T>,
    control,
  });

  React.useEffect(() => {
    const q = Number(quantity.field.value) || 0;
    const p = Number(purchasePrice.field.value) || 0;
    setValue(q * p - (discount.field.value || 0));
  }, [discount.field.value, purchasePrice.field.value, quantity.field.value]);

  return formatCurrency(value);
}
