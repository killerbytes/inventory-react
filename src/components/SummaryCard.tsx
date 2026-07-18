import { Card, CardContent, CardTitle } from "./ui/card";

export default function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  if (!value) return null;

  return (
    <Card className="gap-2 py-4" key={label}>
      <CardContent className="px-4 text-sm text-muted-foreground">
        {label}
        <CardTitle className="text-lg text-foreground">{value}</CardTitle>
      </CardContent>
    </Card>
  );
}
