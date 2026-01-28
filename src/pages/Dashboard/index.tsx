import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Dashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="bg-border h-5 w-[1px]"></div>
          Home
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>Welcome to the home page!</p>
      </CardContent>
    </Card>
  );
}
