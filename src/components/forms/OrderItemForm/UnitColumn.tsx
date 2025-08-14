import { Control, FieldValues, Path, useWatch } from "react-hook-form";
import ColorBadge from "@/components/ColorBadge";
import { UNIT_COLOR } from "@/utils/definitions";
import { useProductStore } from "@/stores";
import React from "react";

export default function UnitColumn<T extends FieldValues>({
  index,
  control,
  name,
}: {
  index: number;
  control: Control<T>;
  name: Path<T>;
}) {
  const { flatProducts } = useProductStore();
  const [unit, setUnit] = React.useState<string>();
  const combinationId = useWatch({
    control,
    name: `${name}.${index}.combinationId` as Path<T>,
  });
  React.useEffect(() => {
    const product = flatProducts.find(
      (i) => i.combinationId === Number(combinationId),
    );
    if (product?.unit) {
      setUnit(product.unit);
    }
  }, [combinationId, flatProducts]);
  return unit && <ColorBadge colorMap={UNIT_COLOR}>{unit}</ColorBadge>;
}
