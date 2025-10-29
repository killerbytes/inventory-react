import { Control, FieldValues, Path, useController } from "react-hook-form";
import { productCombinationServices } from "@/services";
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
  const {
    productCombinations,
    productCombinationsHasLoaded,
    setProductsCombinations,
  } = useProductCombinationStore();
  const [unit, setUnit] = React.useState<string>();
  const { field } = useController({
    name: `${name}.${index}.combinationId` as Path<T>,
    control,
  });
  const combinationId = field.value;

  React.useEffect(() => {
    const getData = async () => {
      if (!productCombinationsHasLoaded) {
        const data = await productCombinationServices.list();
        setProductsCombinations(data);
      }
    };
    getData();
  }, [
    productCombinations,
    productCombinationsHasLoaded,
    setProductsCombinations,
  ]);

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
