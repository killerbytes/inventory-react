import { formatCurrency, formatDate } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import AddPaymentModal from "./AddPaymentModal";
import useToggle from "@/hooks/useToggle";
import { Plus } from "lucide-react";
import { Invoice } from "@/types";
import React from "react";

export default function PaymentTab({
  data,
  cb,
}: {
  data: Invoice;
  cb: (id: number) => Promise<void>;
}) {
  const { toggle, handleToggle } = useToggle({
    addPaymentModal: false,
  });

  const columns: ColumnDef<Invoice>[] = React.useMemo(
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
        accessorKey: "payment.user.username",
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
      <div className="flex justify-end">
        <Button
          onClick={() => {
            handleToggle({ addPaymentModal: true });
          }}
        >
          <Plus /> Add Payment
        </Button>
      </div>
      <DataTable data={data?.applications || []} columns={columns} />
      {toggle.addPaymentModal && (
        <AddPaymentModal
          data={data}
          isOpen={true}
          onClose={() => {
            handleToggle({ addPaymentModal: false });
            cb(Number(data.id));
          }}
        />
      )}
    </div>
  );
}
