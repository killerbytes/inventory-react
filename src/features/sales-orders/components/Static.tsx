import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/utils/formatters";
import { Label } from "@/components/ui/label";
import { SalesOrder } from "@/schemas";

export default function Static({ data }: { data: SalesOrder }) {
  return (
    <Card>
      <CardContent>
        <div className="flex gap-4 justify-between">
          <div>
            <Label className="text-muted-foreground">Order Date</Label>
            <div className="font-semibold text-sm">
              {data?.orderDate ? formatDate(data?.orderDate) : "-"}
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">Customer</Label>
            <div className="font-semibold text-sm">{data?.customer?.name}</div>
          </div>
          <div>
            <Label className="text-muted-foreground">Mode of Payment</Label>
            <div className="font-semibold text-sm">{data?.modeOfPayment}</div>
          </div>
        </div>
        {data.notes && (
          <>
            <Label className="text-muted-foreground">Notes</Label>
            <div className="font-semibold text-sm">{data?.notes}</div>
          </>
        )}
        {data.internalNotes && (
          <>
            <Label className="text-muted-foreground">Internal Notes</Label>
            <div className="font-semibold text-sm">{data?.internalNotes}</div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
