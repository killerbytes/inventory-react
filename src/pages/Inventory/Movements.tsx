import {
  INVENTORY_MOVEMENT_TYPE_OPTIONS,
  PAGINATION,
  PAGINATION_RESPONSE,
} from "@/utils/definitions";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ApiErrorResponse,
  InventoryMovement,
  PaginatedResponse,
} from "@/schemas";
import DateRangePicker from "@/components/DateRangePicker";
import { SidebarTrigger } from "@/components/ui/sidebar";
import SectionCards from "@/components/SectionCards";
import { endOfMonth, startOfMonth } from "date-fns";
import Movements from "@/components/Movements";
import { useSearchParams } from "react-router";
import { inventoryServices } from "@/services";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import Select from "@/components/Select";
import Loader from "@/components/Loader";
import Pager from "@/components/Pager";
import React from "react";

interface FilterProps {
  limit: number;
  page: number;
  type: string;
  q: string;
  from?: Date;
  to?: Date;
}

const parseParamsToFilter = (params: URLSearchParams): FilterProps => {
  return {
    limit: Number(params.get("limit")) || PAGINATION.PAGE_SIZE,
    page: Number(params.get("page")) || PAGINATION.PAGE,
    type: params.get("type") || "ALL",
    q: params.get("q") || "",
    from: params.get("from")
      ? new Date(params.get("from")!)
      : startOfMonth(new Date()),
    to: params.get("to") ? new Date(params.get("to")!) : endOfMonth(new Date()),
  };
};

export default function InventoryMovements() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = React.useState(true);
  const [data, setData] =
    React.useState<PaginatedResponse<InventoryMovement>>(PAGINATION_RESPONSE);

  const [filter, setFilter] = React.useState<FilterProps>(() =>
    parseParamsToFilter(searchParams),
  );

  const getData = React.useCallback(async (currentFilter: FilterProps) => {
    setLoading(true);
    try {
      const payload = {
        ...currentFilter,
        q: currentFilter.q === "" ? undefined : currentFilter.q,
        type: currentFilter.type === "ALL" ? undefined : currentFilter.type,
        startDate: currentFilter.from?.toISOString(),
        endDate: currentFilter.to?.toISOString(),
      };

      const data = await inventoryServices.getMovements(payload);
      setData(data);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      console.error("Error fetching data:", apiError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedQuery = useDebounce(filter, 300);

  // Sync state to URL
  React.useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(debouncedQuery).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (value instanceof Date) {
          params.set(key, value.toISOString());
        } else {
          params.set(key, String(value));
        }
      }
    });
    setSearchParams(params, { replace: true });
  }, [debouncedQuery, setSearchParams]);

  // Sync state from URL (Back/Forward navigation)
  React.useEffect(() => {
    const newFilter = parseParamsToFilter(searchParams);

    // Deep comparison to avoid infinite loop
    const isDifferent =
      newFilter.q !== filter.q ||
      newFilter.type !== filter.type ||
      newFilter.page !== filter.page ||
      newFilter.limit !== filter.limit ||
      newFilter.from?.getTime() !== filter.from?.getTime() ||
      newFilter.to?.getTime() !== filter.to?.getTime();

    if (isDifferent) {
      setFilter(newFilter);
    }
  }, [searchParams]);

  // Fetch data on filter change
  React.useEffect(() => {
    getData(debouncedQuery);
  }, [debouncedQuery, getData]);

  return (
    <Card>
      <CardHeader className="px-2 md:px-4">
        <CardTitle className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="bg-border h-5 w-[1px]"></div>
          Inventory Movements
        </CardTitle>
        <CardAction></CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-2 md:px-4">
        <SectionCards data={data.summary || []} />
        <div className="flex flex-col md:flex-row gap-2 justify-between items-center">
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
          <div className="w-full">
            <DateRangePicker
              value={{ from: filter.from, to: filter.to }}
              onChange={(range) => {
                setFilter((prev) => ({
                  ...prev,
                  from: range.from,
                  to: range.to,
                  page: 1,
                }));
              }}
            />
          </div>
          <div className="w-full">
            <Select
              options={INVENTORY_MOVEMENT_TYPE_OPTIONS}
              value={filter.type}
              onChange={(type) => {
                setFilter(({ ...prev }) => ({ ...prev, type }));
              }}
            />
          </div>
        </div>
        <Loader isLoading={loading} />
        <Movements data={data.data} />
        {data.meta.totalPages > 1 && (
          <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
        )}
      </CardContent>
    </Card>
  );
}
