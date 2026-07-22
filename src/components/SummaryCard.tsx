import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";

export default function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number | React.ReactNode;
}) {
  if (!value) return null;

  return (
    <Card className="gap-2 py-4 h-full" key={label}>
      <CardContent className="px-4 flex flex-col h-full">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-lg mt-auto">{value}</CardTitle>
      </CardContent>
    </Card>
  );
}
