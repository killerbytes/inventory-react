import { Control, UseFormSetValue, useWatch } from "react-hook-form";
import { PurchaseOrder } from "@/services";
import { useProductStore } from "@/stores";
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
    const product = products?.find((p) => p.id === productId);
    if (product) {
      setValue(`purchaseOrderItems.${index}.unit`, product.unit);
    }
  }, [index, productId, products, setValue]);

  return (
    // <Controller
    //   name={`purchaseOrderItems.${index}.unit`}
    //   control={control}
    //   render={({ field }) => (
    //     <Select
    //       value={field.value}
    //       onChange={field.onChange}
    //       options={UNIT_OPTIONS}
    //     />
    //   )}
    // />
    `${unit || ""}`
  );
}
