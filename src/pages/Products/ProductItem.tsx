import { PackageOpen, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import UnitBadge from "@/components/UnitBadge";
import { Product } from "@/services";

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
    <div className="flex gap-4 items-center">
      <div>{product.name}</div>
      <div className="flex gap-2 ml-auto items-center">
        <UnitBadge unit={product.unit} />
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
