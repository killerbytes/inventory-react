import { PackageOpen, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <div>{product.name}</div>
        {product.description && (
          <div className="text-xs text-gray-500">{product.description}</div>
        )}
      </div>
      <div className="flex gap-2 ml-auto items-center">
        <div className="w-20 justify-end flex gap-2">
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
