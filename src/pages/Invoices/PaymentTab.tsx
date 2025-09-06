import { formatCurrency } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { paymentServices } from "@/services";
import { GoodReceipt } from "@/types";
import React from "react";

export default function PaymentTab({ data }) {
  console.log(data);
  const onSubmit = () => {
    const { supplierId } = data;
    paymentServices.create({
      paymentDate: new Date(),
      referenceNo: "CHECK001",
      amount: 100,
      supplierId,
      applications: [
        {
          invoiceId: data.id,
          amountApplied: 10,
        },
      ],
    });
  };
  const columns: ColumnDef<GoodReceipt>[] = React.useMemo(
    () => [
      {
        accessorKey: "referenceNo",
        header: "Reference",
      },

      {
        accessorKey: "amountApplied",
        header: () => "Amount Applied",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => formatCurrency(row.getValue("amountApplied")),
      },
    ],
    [],
  );
  return (
    <div>
      PaymentTab
      <Button onClick={onSubmit}>Pay</Button>
      <DataTable data={data.applications || []} columns={columns} />
    </div>
  );
}
