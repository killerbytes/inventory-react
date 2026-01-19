import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ApiErrorResponse,
  filterProps,
  InventoryMovement,
  PaginatedResponse,
} from "@/types";
import {
  INVENTORY_MOVEMENT_TYPE_OPTIONS,
  PAGINATION,
} from "@/utils/definitions";
import DateRangePicker from "@/components/DateRangePicker";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { formatCurrency } from "@/utils/formatters";
import { endOfMonth, startOfMonth } from "date-fns";
import Movements from "@/components/Movements";
import { inventoryServices } from "@/services";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import Select from "@/components/Select";
import Loader from "@/components/Loader";
import Pager from "@/components/Pager";
import React from "react";

export default function InventoryMovements() {
  const [range, setRange] = React.useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<PaginatedResponse<InventoryMovement>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    type: "ALL",
    q: "",
  });
  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        ...filter,
        ...(range?.from && range?.to && { startDate: range.from }),
        ...(range?.from && range?.to && { endDate: range.to }),
        q: filter.q === "" ? undefined : filter.q,
        type: filter.type === "ALL" ? undefined : filter.type,
      };

      const data = await inventoryServices.getMovements(payload);
      setData(data);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      console.error("Error fetching data:", apiError.message);
    } finally {
      setLoading(false);
    }
  }, [filter, range.from, range.to]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="bg-border h-5 w-[1px]"></div>
          Inventory Movements
        </CardTitle>
        <CardAction></CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex gap-2 justify-between items-center">
          <Input
            placeholder="Search Product"
            className="w-full"
            value={filter.q}
            onChange={(e) => {
              setFilter((prev) => ({
                ...prev,
                q: e.target.value,
                page: 1,
              }));
            }}
          />
          <DateRangePicker value={range} onChange={setRange} />
          <Select
            options={INVENTORY_MOVEMENT_TYPE_OPTIONS}
            value={filter.type}
            onChange={(type) => {
              setFilter(({ ...prev }) => ({ ...prev, type }));
            }}
          />
          <div className="text-xl">{formatCurrency(data?.totalAmount)}</div>
        </div>
        <Loader isLoading={loading} />
        <Movements data={data.data} />
        {data.totalPages > 1 && (
          <Pager data={data} filter={filter} setFilter={setFilter} />
        )}
      </CardContent>
    </Card>
  );
}
