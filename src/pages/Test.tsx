import { DataTable } from "@/components/DataTable";
import { supplierServices } from "@/services";
import React from "react";

export default function Test() {
  const [data, setData] = React.useState<any[]>([]);
  const getData = React.useCallback(async () => {
    const res = await supplierServices.getByProductId(111);
    console.log(res.combinations[0]);
    setData(res.combinations[0].goodReceiptLines);

    // setData(res);
  }, []);

  React.useEffect(() => {
    getData();
  }, []);

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "nameSnapshot",
        header: "Name",
        meta: {},
      },
      {
        accessorKey: "purchasePrice",
        header: "From",
      },

      {
        accessorKey: "goodReceipt.supplier.name",
        header: "User",
      },
    ],
    [],
  );

  return (
    <div>
      <DataTable data={data} columns={columns} />
    </div>
  );
}
