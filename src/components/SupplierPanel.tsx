export default function SupplierPanel({
  supplier,
}: {
  supplier: Supplier | undefined;
}) {
  return (
    <div className="bg-blue-100 px-4 py-2 rounded-md border border-blue-200 flex flex-col gap-2 text-sm">
      <h3 className="text-lg gap-2 flex  items-center">{supplier?.name}</h3>
      <div className="">{supplier?.address}</div>
      <p>{supplier?.phone}</p>
    </div>
  );
}
