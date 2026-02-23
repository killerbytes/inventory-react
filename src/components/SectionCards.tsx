import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import { formatCurrency } from "@/utils/formatters";
import { Summary } from "@/schemas";

export default function SectionCards({
  data,
}: {
  data: Summary[] | undefined;
}) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xl">
      {data.map((item) => (
        <Card className="gap-4" key={item.label}>
          <CardContent className="text-sm">{item.label}</CardContent>
          <CardFooter className="mt-auto">
            <CardTitle>{formatCurrency(item.value)}</CardTitle>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
