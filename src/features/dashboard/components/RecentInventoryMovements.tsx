import { useMovements } from "@/features/inventory/hooks/useInventory";
import { endOfMonth, startOfMonth } from "date-fns";
import Movements from "@/components/Movements";
import React from "react";

export default function RecentInventoryMovements() {
  const payload = React.useMemo(
    () => ({
      limit: 5,
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
    }),
    [],
  );

  const { data } = useMovements(payload);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-semibold">Recent Inventory Movements</h1>
      <Movements data={data?.data} />
    </div>
  );
}
