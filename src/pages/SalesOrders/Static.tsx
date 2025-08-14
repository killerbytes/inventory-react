import { formatDate } from "@/utils/formatters";
import { Label } from "@/components/ui/label";
import { SalesOrder } from "@/types";

export default function Static({ data }: { data: SalesOrder }) {
  return (
    <>
      <div className="flex flex-col gap-4">
        <Label>Sales Order Number</Label>
        <div className="font-semibold text-sm">{data?.salesOrderNumber}</div>
        <Label>Order Date</Label>
        <div className="font-semibold text-sm">
          {data?.orderDate ? formatDate(data?.orderDate) : "-"}
        </div>
        <Label>Customer</Label>
        <div className="font-semibold text-sm">{data?.customer?.name}</div>
        <Label>Mode of Payment</Label>
        <div className="font-semibold text-sm">{data?.modeOfPayment}</div>
        <Label>Notes</Label>
        <div className="font-semibold text-sm">{data?.notes}</div>
        <Label>Internal Notes</Label>
        <div className="font-semibold text-sm">{data?.internalNotes}</div>
      </div>
    </>
  );
}
