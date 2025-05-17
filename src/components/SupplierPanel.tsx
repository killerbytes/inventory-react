import type { Supplier } from "@/pages/Suppliers";
import { Pencil } from "lucide-react";
import React from "react";

export default function SupplierPanel({
  supplier,
  editable = false,
}: {
  supplier: Supplier;
  editable?: boolean;
}) {
  return (
    <div>
      <h3 className="text-lg gap-2 flex  items-center">
        {supplier?.name}
        {editable && (
          <Pencil size={16} className="opacity-0 group-hover:opacity-100" />
        )}
      </h3>
      <p>
        {supplier?.address}, {supplier?.phone}
      </p>
    </div>
  );
}
