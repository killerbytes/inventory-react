import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import { formatCurrency } from "@/utils/formatters";
import { Summary } from "@/types";

export default function SectionCards({ data }: { data: Summary[] }) {
  console.log(data);

  if (!data) return null;

  return (
    <div className="grid grid-cols-4 gap-4 text-xl">
      {data.map((item) => (
        <Card className="gap-4">
          <CardContent className="text-sm">{item.label}</CardContent>
          <CardFooter className="mt-auto">
            <CardTitle>{formatCurrency(item.value)}</CardTitle>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
