import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

export default function Home() {
  const getData = async () => {
    // try {
    //   const response = await categoryServices.getAll({
    //     limit: 10,
    //     page: 1,
    //   });
    //   const data = response.data;
    // } catch (error) {
    //   console.error("Error fetching data:", error);
    // }
  };

  React.useEffect(() => {
    getData();
  }, []);
  return (
    <div>
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
    </div>
  );
}
