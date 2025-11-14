import { formatDate } from "@/utils/formatters";
import { Label } from "@/components/ui/label";
import { SalesOrder } from "@/types";

export default function Static({ data }: { data: SalesOrder }) {
  return (
    <>
      <div className="flex gap-4 justify-between">
        <div>
          <Label>Sales Order Number</Label>
          <div className="font-semibold text-sm">{data?.salesOrderNumber}</div>
        </div>
        <div>
          <Label>Order Date</Label>
          <div className="font-semibold text-sm">
            {data?.orderDate ? formatDate(data?.orderDate) : "-"}
          </div>
        </div>
        <div>
          <Label>Customer</Label>
          <div className="font-semibold text-sm">{data?.customer?.name}</div>
        </div>
        <div>
          <Label>Mode of Payment</Label>
          <div className="font-semibold text-sm">{data?.modeOfPayment}</div>
        </div>
      </div>
      <Label>Notes</Label>
      <div className="font-semibold text-sm">{data?.notes}</div>
      <Label>Internal Notes</Label>
      <div className="font-semibold text-sm">{data?.internalNotes}</div>
    </>
  );
}
