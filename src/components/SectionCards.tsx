import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import { formatCurrency } from "@/utils/formatters";
import { Summary } from "@/types";

export default function SectionCards({ data }: { data: Summary | undefined }) {
  return (
    <div className="grid grid-cols-4 gap-4 text-xl">
      <Card className="gap-4">
        <CardContent className="text-sm">Total</CardContent>
        <CardFooter className="mt-auto">
          <CardTitle>{formatCurrency(data?.totalAmount || 0)}</CardTitle>
        </CardFooter>
      </Card>
      {!!data?.totalCost && (
        <Card className="gap-4">
          <CardContent className="text-sm">Profit</CardContent>
          <CardFooter className="mt-auto">
            <CardTitle>
              {formatCurrency(
                (data?.totalAmount || 0) - (data?.totalCost || 0),
              )}
            </CardTitle>
          </CardFooter>
        </Card>
      )}
      <Card className="gap-4">
        <CardContent className="text-sm">Returns</CardContent>
        <CardFooter className="mt-auto">
          <CardTitle>{formatCurrency(data?.totalReturnAmount || 0)}</CardTitle>
        </CardFooter>
      </Card>
      {!!data?.totalExchangeAmount && (
        <Card className="gap-4">
          <CardContent className="text-sm">Exchanges</CardContent>
          <CardFooter className="mt-auto">
            <CardTitle>
              {formatCurrency(data?.totalExchangeAmount || 0)}
            </CardTitle>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
