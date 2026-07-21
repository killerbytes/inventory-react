import { useMovements } from "@/features/inventory/hooks/useInventory";
import { endOfMonth, startOfMonth } from "date-fns";
import Movements from "@/components/Movements";
import React from "react";

export default function RecentInventoryMovements() {
  const filter = {
    limit: 5,
    page: 1,
    type: "ALL",
    q: "",
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  };

  const payload = React.useMemo(() => {
    return {
      ...filter,
      q: filter.q === "" ? undefined : filter.q,
      type: filter.type === "ALL" ? undefined : filter.type,
      startDate: filter.from?.toISOString(),
      endDate: filter.to?.toISOString(),
    };
  }, [filter]);

  const { data } = useMovements(payload);

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-semibold">Recent Inventory Movements</h1>
      <Movements data={data?.data} />
    </div>
  );
}
