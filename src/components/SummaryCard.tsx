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
    <Card className="gap-2 py-4 h-full" key={label}>
      <CardContent className="px-4 text-sm text-muted-foreground flex flex-col h-full">
        {label}
        <CardTitle className="text-lg text-foreground mt-auto">
          {value}
        </CardTitle>
      </CardContent>
    </Card>
  );
}
