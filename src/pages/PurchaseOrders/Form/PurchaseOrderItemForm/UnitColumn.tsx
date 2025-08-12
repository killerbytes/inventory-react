import { Control, useWatch } from "react-hook-form";
import UnitBadge from "@/components/UnitBadge";
import { useProductStore } from "@/stores";
import { PurchaseOrder } from "@/types";
import React from "react";

export default function UnitColumn({
  index,
  control,
}: {
  index: number;
  control: Control<PurchaseOrder>;
}) {
  const { flatProducts } = useProductStore();
  const [unit, setUnit] = React.useState<string>();
  // const productId = useWatch({
  //   control,
  //   name: `purchaseOrderItems.${index}.combinationId`,
  // });
  const combinationId = useWatch({
    control,
    name: `purchaseOrderItems.${index}.combinationId`,
  });
  React.useEffect(() => {
    const product = flatProducts.find(
      (i) => i.combinationId === Number(combinationId),
    );
    if (product?.unit) {
      setUnit(product.unit);
    }
    // const product = products
    //   .map((item) =>
    //     item.products.find((product) => product.id === Number(productId)),
    //   )
    //   .filter(Boolean);
    // if (product[0]) {
    //   setValue(`purchaseOrderItems.${index}.combinationId`, product[0].combinationId);
    // }
  }, [combinationId, flatProducts]);
  return unit && <UnitBadge>{unit}</UnitBadge>;
}
