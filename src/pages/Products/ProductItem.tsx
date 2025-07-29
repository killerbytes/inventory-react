import { PackageOpen, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import UnitBadge from "@/components/UnitBadge";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/services";

export default function ProductItem({
  product,
  sub = false,
}: {
  product: Product;
  sub: boolean;
}) {
  return (
    <div className="flex gap-4 items-center">
      <div>
        {product.name} / {product.unit}
      </div>
      <div className="flex gap-2 ml-auto items-center">
        <UnitBadge unit={product.unit} />
        <Badge>{product.reorderLevel}</Badge>
        <div className="w-20 justify-end flex">
          {!sub && (
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => {
                setSelected(row.original);
                handleToggle({ newPackageModal: true });
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
              setSelected(row.original);
              handleToggle({ editModal: true });
            }}
          >
            <Pencil />
          </Button>
        </div>
      </div>
    </div>
  );
}
