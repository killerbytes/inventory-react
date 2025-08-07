import { formatCurrency } from "@/utils/formatters";
import { cx } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { ProductCombinations } from "@/types";
import { PackageOpen } from "lucide-react";

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
        <div className="text-muted-foreground">
          {item.sku} @ {item.Inventory?.quantity}
        </div>
      </div>
      <div className="flex gap-8 ml-auto items-center">
        <div className="flex gap-2 items-center">
          <Badge
            variant="outline"
            className={cx({
              "bg-red-100": Number(item.price) === 0,
            })}
          >
            {formatCurrency(item.price)}
          </Badge>
          {/* <div>{item.reorderLevel}</div> */}
        </div>
        <div className="flex gap-2">
          {item.values.map((value) => (
            <Badge variant="outline" key={value.variantTypeId}>
              {value.value}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
