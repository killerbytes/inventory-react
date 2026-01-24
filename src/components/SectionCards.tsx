import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { formatCurrency } from "@/utils/formatters";
import { Summary } from "@/types";

export default function SectionCards({ data }: { data: Summary | undefined }) {
  return (
    <div className="grid grid-cols-3 gap-4  ">
      <Card>
        <CardHeader>
          <CardDescription>Grand Total</CardDescription>
          <CardTitle>{formatCurrency(data?.totalAmount || 0)}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Total Return Amount</CardDescription>
          <CardTitle>{formatCurrency(data?.totalReturnAmount || 0)}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Total Exchange Amount</CardDescription>
          <CardTitle>
            {formatCurrency(data?.totalExchangeAmount || 0)}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
