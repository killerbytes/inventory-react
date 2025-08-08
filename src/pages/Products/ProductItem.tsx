import UnitBadge from "@/components/UnitBadge";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/utils/definitions";
import { Pencil } from "lucide-react";
import { Link } from "react-router";
import { Product } from "@/types";

export default function ProductItem({
  item,
}: {
  item: Product;
  sub?: boolean;
  onSelect: (product: Product) => void;
  onToggle: (toggle: {
    newPackageModal?: boolean;
    editModal?: boolean;
  }) => void;
}) {
  return (
    <div className="flex items-center px-4 py-1 hover:bg-gray-100 border border-t-0">
      <div className="flex items-center flex-row">
        <div>
          <div className="flex gap-2 items-center">
            <div className="font-semibold">{item.name}</div>
            <UnitBadge>{item.unit}</UnitBadge>
          </div>
          {item.description && (
            <div className="text-xs text-gray-500">{item.description}</div>
          )}
        </div>
      </div>
      <div className="flex gap-2 ml-auto items-center">
        <div className="ml-auto"></div>
        <div className="w-20 justify-end flex gap-2">
          <Link to={`${ROUTES.PRODUCTS}/${item.id}/edit`}>
            <Pencil size="16" />
          </Link>
        </div>
      </div>
    </div>
  );
}
