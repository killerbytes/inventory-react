import { Supplier } from "@/services";

export default function SupplierPanel({
  supplier,
}: {
  supplier: Supplier | undefined;
}) {
  return (
    <div className="bg-blue-100 px-4 py-2 rounded-md border border-blue-200">
      <h3 className="text-lg gap-2 flex  items-center">{supplier?.name}</h3>
      <p>
        {supplier?.address}, {supplier?.phone}
      </p>
    </div>
  );
}
