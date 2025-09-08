import { formatCurrency, formatDate } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import AddPaymentModal from "./AddPaymentModal";
import { paymentServices } from "@/services";
import useToggle from "@/hooks/useToggle";
import { GoodReceipt } from "@/types";
import { Plus } from "lucide-react";
import React from "react";

export default function PaymentTab({
  data,
  cb,
}: {
  data: GoodReceipt;
  cb: () => void;
}) {
  const { toggle, handleToggle } = useToggle({
    addPaymentModal: false,
  });

  console.log(data);
  const onSubmit = () => {
    const { supplierId } = data;
    paymentServices.create({
      paymentDate: new Date(),
      referenceNo: "CHECK001",
      amount: 263990.0,
      supplierId,
      applications: [
        {
          invoiceId: data.id,
          amountApplied: 263990.0,
        },
      ],
    });
  };
  const columns: ColumnDef<GoodReceipt>[] = React.useMemo(
    () => [
      {
        accessorKey: "payment.referenceNo",
        header: "Reference",
      },
      {
        accessorKey: "payment.paymentDate",
        header: "Payment Date",
        cell: ({ row }) => {
          return formatDate(row.original.payment.paymentDate);
        },
      },
      {
        accessorKey: "payment.user.name",
        header: "Changed By",
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
      {
        accessorKey: "amountRemaining",
        header: () => "Amount Remaining",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => formatCurrency(row.getValue("amountRemaining")),
      },
    ],
    [],
  );
  return (
    <div className="flex flex-col gap-4">
      {/* PaymentTab */}
      {/* <Button onClick={onSubmit}>Pay</Button> */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            handleToggle({ addPaymentModal: true });
          }}
        >
          <Plus /> Add Payment
        </Button>
      </div>
      <DataTable data={data.applications || []} columns={columns} />
      {toggle.addPaymentModal && (
        <AddPaymentModal
          data={data}
          isOpen={true}
          onClose={() => {
            handleToggle({ addPaymentModal: false });
            cb(data.id);
          }}
        />
      )}
    </div>
  );
}
