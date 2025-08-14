import { PackageOpen, Pencil } from "lucide-react";
import { UNIT_COLOR } from "@/utils/definitions";
import UnitBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Inventory } from "@/types";

export default function InventoryItem({
  inventory,
  sub = false,
  onSelect,
  onToggle,
}: {
  inventory: Inventory;
  sub?: boolean;
  onSelect: (inventory: Inventory) => void;
  onToggle: (toggle: {
    newPackageModal?: boolean;
    editModal?: boolean;
  }) => void;
}) {
  const { parentId, product, unit, price, reorderLevel, quantity } = inventory;
  return (
    <div className={cx("flex  items-center  py-1 hover:bg-gray-100")}>
      {sub && (
        <div>
          <PackageOpen size="16" color="green" className="ml-6" />
        </div>
      )}
      <div
        className={cx(
          "ml-1",
          { "font-semibold": !sub },
          { "text-primary": sub },
        )}
      >
        <div>{product.name}</div>
        {product.description && (
          <div className="text-xs text-gray-500">{product.description}</div>
        )}
      </div>
      <div className="flex gap-2 ml-auto items-center">
        <UnitBadge unit={unit as keyof typeof UNIT_COLOR} />
        <div className="w-15 text-right">{price}</div>
        <div
          className={cx("w-15 text-right", {
            "text-red-500 font-semibold": quantity <= reorderLevel,
          })}
        >
          {quantity}
        </div>
        <div className="w-20 text-center">{reorderLevel}</div>
        <div className="w-20 justify-end items-center flex gap-2 ">
          {!parentId && (
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={quantity <= 0}
              onClick={() => {
                onSelect(inventory);
                onToggle({ newPackageModal: true });
              }}
            >
              <PackageOpen />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => {
              onSelect(inventory);
              onToggle({ editModal: true });
            }}
          >
            <Pencil />
          </Button>
        </div>
      </div>
    </div>
  );
}
