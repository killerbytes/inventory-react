import { Product, ProductCombinations } from "@/types";
import { PackageOpen, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { ROUTES } from "@/utils/definitions";
import { Link } from "react-router";

export default function CombinationItem({
  item,
}: {
  item: ProductCombinations;
}) {
  return (
    <div
      className={cx(
        "flex  items-center px-4 py-1 hover:bg-gray-100 border border-t-0",
      )}
    >
      {<PackageOpen size="16" color="green" className="ml-1" />}
      <div
        className={cx(
          "ml-1 flex items-center gap-2",
          "font-semibold",
          "text-primary",
        )}
      >
        <div>{item.sku}</div>
        <div>{item.price}</div>
        <div>{item.reorderLevel}</div>
        <div>{item.Inventory?.quantity}</div>
      </div>
      <div className="flex gap-2 ml-auto items-center">
        <div className="flex gap-2">
          {item.values.map((value) => (
            <div key={value.variantTypeId}>{value.value}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
