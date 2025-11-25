import { Control, FieldValues, Path, useController } from "react-hook-form";
import { useStore } from "@/stores";
import React from "react";

export default function PriceColumn<T extends FieldValues>({
  index,
  control,
  name,
}: {
  index: number;
  control: Control<T>;
  name: Path<T>;
}) {
  const {
    productCombinationState: { productCombinations },
  } = useStore();
  const [purchasePrice, setPurchasePrice] = React.useState<number>();
  const { field } = useController({
    name: `${name}.${index}.combinationId` as Path<T>,
    control,
  });
  const combinationId = field.value;

  React.useEffect(() => {
    const product = productCombinations.find(
      (i) => i.id === Number(combinationId),
    );
    if (product?.price) {
      setPurchasePrice(product.price);
    }
  }, [combinationId, productCombinations]);

  return purchasePrice;
}
