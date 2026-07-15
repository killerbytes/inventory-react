import { Card, CardContent, CardTitle } from "./ui/card";
import { formatCurrency } from "@/utils/formatters";
import { Summary } from "@/schemas";

export default function SectionCards({
  data,
}: {
  data: Summary[] | undefined;
}) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xl">
      {data.map((item) => (
        <Card className="gap-2 py-4" key={item.label}>
          <CardContent className="px-4 text-sm text-muted-foreground">
            {item.label}
            <CardTitle className="text-lg text-foreground">
              {formatCurrency(item.value)}
            </CardTitle>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
