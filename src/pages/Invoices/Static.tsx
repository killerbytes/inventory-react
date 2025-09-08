import { formatCurrency, formatDate } from "@/utils/formatters";
import InvoiceLineTable from "./InvoiceLineTable";
import { Label } from "@/components/ui/label";

export default function Static({ data }) {
  const remainingBalance = data?.applications.reduce((acc, val) => {
    return acc + parseFloat(val.amountApplied ?? "0");
  }, 0);
  return (
    <div>
      {data && (
        <>
          <div className="flex flex-col gap-4">
            <div className="flex">
              <div className="w-1/3">
                <Label>Invoice Number</Label>
                <div className="font-semibold text-sm">
                  {data?.invoiceNumber}
                </div>
              </div>
              <div className="w-1/3">
                <Label>Invoice Date</Label>
                <div className="font-semibold text-sm">
                  {data?.invoiceDate ? formatDate(data?.invoiceDate) : "-"}
                </div>
              </div>
              <div className="w-1/3">
                <Label>Due Date</Label>
                <div className="font-semibold text-sm">
                  {formatDate(data?.dueDate)}
                </div>
              </div>
              <div className="w-1/3">
                <Label>Remaining Balance</Label>
                <div className="font-semibold text-sm">
                  {formatCurrency(
                    parseFloat(data.totalAmount) - remainingBalance,
                  )}
                </div>
              </div>
            </div>
            <div className="w-full">
              <Label>Notes</Label>
              <div className="font-semibold text-sm">{data?.notes}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
