import { PackageOpen, Pencil } from "lucide-react";
import { UNIT_COLOR } from "@/utils/definitions";
import { Button } from "@/components/ui/button";
import UnitBadge from "@/components/UnitBadge";
import { cx } from "class-variance-authority";
import { Product } from "@/types";

export default function ProductItem({
  product,
  sub = false,
  onSelect,
  onToggle,
}: {
  product: Product;
  sub?: boolean;
  onSelect: (product: Product) => void;
  onToggle: (toggle: {
    newPackageModal?: boolean;
    editModal?: boolean;
  }) => void;
}) {
  return (
    <div
      className={cx(
        "flex  items-center px-4 py-1 hover:bg-gray-100 border border-t-0",
      )}
    >
      {sub && <PackageOpen size="16" color="green" className="ml-1" />}
      <div
        className={cx(
          "ml-1",
          { "font-semibold": !sub },
          { "text-primary": sub },
        )}
      >
        {product.name} {product.description && `(${product.description})`}
      </div>
      <div className="flex gap-2 ml-auto items-center">
        <UnitBadge unit={product.unit as keyof typeof UNIT_COLOR} />
        <div className="w-20 justify-end flex gap-2">
          {!sub && (
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => {
                onSelect(product);
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
              onSelect(product);
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
