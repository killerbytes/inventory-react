import { ROUTES } from "@/utils/definitions";
import { Supplier } from "@/schemas";
import { Link } from "react-router";

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
