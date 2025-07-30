import { Control, UseFormSetValue, useWatch } from "react-hook-form";
import UnitBadge from "@/components/UnitBadge";
import { useProductStore } from "@/stores";
import { PurchaseOrder } from "@/types";
import React from "react";

export default function Unit({
  index,
  control,
  setValue,
}: {
  index: number;
  control: Control<PurchaseOrder>;
  setValue: UseFormSetValue<PurchaseOrder>;
}) {
  const { products } = useProductStore();
  const productId = useWatch({
    control,
    name: `purchaseOrderItems.${index}.productId`,
  });
  const unit = useWatch({
    control,
    name: `purchaseOrderItems.${index}.unit`,
  });
  React.useEffect(() => {
    const product = products
      .map((item) =>
        item.products.find((product) => product.id === Number(productId)),
      )
      .filter(Boolean);

    if (product[0]) {
      setValue(`purchaseOrderItems.${index}.unit`, product[0].unit);
    }
  }, [index, productId, products, setValue]);
  return unit && <UnitBadge unit={unit} />;
}
