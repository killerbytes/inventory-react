import { Control, Path, useWatch } from "react-hook-form";
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
  const quantity =
    useWatch({
      control,
      name: `${name}.${index}.quantity` as Path<T>,
    }) || 0;

  const discount =
    useWatch({
      control,
      name: `${name}.${index}.discount` as Path<T>,
    }) || 0;

  const price =
    useWatch({
      control,
      name: `${name}.${index}.purchasePrice` as Path<T>,
    }) || 0;

  React.useEffect(() => {
    const q = Number(quantity) || 0;
    const p = Number(price) || 0;
    setValue(q * p - discount);
  }, [discount, price, quantity]);

  return formatCurrency(value);
}
