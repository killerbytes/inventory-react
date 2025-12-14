import { ROUTES } from "@/utils/definitions";
import { Link } from "react-router";
import { Supplier } from "@/types";

export default function SupplierPanel({
  supplier,
}: {
  supplier: Supplier | undefined;
}) {
  return (
    <div>
      <h3 className="text-lg gap-2 flex  items-center">
        <Link
          to={`${ROUTES.SUPPLIERS}/${supplier?.id}`}
          className="text-primary"
        >
          {supplier?.name}
        </Link>
      </h3>
    </div>
  );
}
