import { Control, FieldValues, Path, useController } from "react-hook-form";
import { useProductCombinationStore } from "@/stores";
import ColorBadge from "@/components/ColorBadge";
import { UNIT_COLOR } from "@/utils/definitions";
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
  const { productCombinations } = useProductCombinationStore();
  const [unit, setUnit] = React.useState<string>();
  const { field } = useController({
    name: `${name}.${index}.combinationId` as Path<T>,
    control,
  });
  const combinationId = field.value;

  React.useEffect(() => {
    const product = productCombinations.find(
      (i) => i.id === Number(combinationId),
    );
    if (product?.unit) {
      setUnit(product.unit);
    }
  }, [combinationId, productCombinations]);

  return unit && <ColorBadge colorMap={UNIT_COLOR}>{unit}</ColorBadge>;
}
