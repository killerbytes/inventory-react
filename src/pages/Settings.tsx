import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ApiErrorResponse } from "@/schemas";
import { Loader2Icon } from "lucide-react";
import Http from "@/services/http";
import { toast } from "sonner";
import React from "react";

export default function Settings() {
  const [loading, setLoading] = React.useState(false);
  const onBackupClick = async () => {
    try {
      setLoading(true);
      const http = new Http();
      await http.post("/backup", {});
      toast.success("Backup successful");
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>Settings</CardHeader>
      <CardContent>
        <Button onClick={onBackupClick}>
          {loading && <Loader2Icon className="animate-spin" />}
          Backup DB
        </Button>
      </CardContent>
    </Card>
  );
}
