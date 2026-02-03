import {
  ORDER_STATUS_OPTIONS,
  PAGINATION,
  PAGINATION_RESPONSE,
  ROUTES,
  STATUS_COLOR,
} from "@/utils/definitions";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoodReceipt, PaginatedResponse, filterProps } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import DateRangePicker from "@/components/DateRangePicker";
import { SidebarTrigger } from "@/components/ui/sidebar";
import SectionCards from "@/components/SectionCards";
import { Link, useNavigate } from "react-router-dom";
import { endOfMonth, startOfMonth } from "date-fns";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { mappedStatusHistory } from "@/lib/utils";
import ColumnSort from "@/components/ColumnSort";
import ColorBadge from "@/components/ColorBadge";
import { goodReceiptServices } from "@/services";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import Select from "@/components/Select";
import Pager from "@/components/Pager";
import { Plus } from "lucide-react";
import React from "react";

export default function GoodReceipts() {
  const navigate = useNavigate();
  const [data, setData] =
    React.useState<PaginatedResponse<GoodReceipt>>(PAGINATION_RESPONSE);

  const [loading, setLoading] = React.useState(true);
  const [range, setRange] = React.useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    status: "ALL",
    sort: "id",
    order: "DESC",
    q: "",
  });

  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        ...filter,
        ...(range?.from && range?.to && { startDate: range.from }),
        ...(range?.from && range?.to && { endDate: range.to }),

        status: filter.status === "ALL" ? undefined : filter.status,
      };
      const data: PaginatedResponse<GoodReceipt> =
        await goodReceiptServices.getAll(payload);
      setData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [filter, range.from, range.to]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  const handleFilterChange = React.useCallback((data: filterProps) => {
    setFilter((prevState) => ({ ...prevState, ...data }));
  }, []);

  const columns: ColumnDef<GoodReceipt>[] = React.useMemo(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Id
            </ColumnSort>
          );
        },
      },
      {
        accessorKey: "supplier.name",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
              sortKey="supplier.name"
            >
              Supplier
            </ColumnSort>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Status
            </ColumnSort>
          );
        },
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <ColorBadge colorMap={STATUS_COLOR}>{String(status)}</ColorBadge>
          );
        },
      },

      {
        header: "User",
        cell: ({ row }) => {
          const statusHistoryMap = mappedStatusHistory(
            row.original.goodReceiptStatusHistory ?? [],
          );
          return statusHistoryMap[row.original.status]?.user.username;
        },
      },
      {
        accessorKey: "receiptDate",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Receipt Date
            </ColumnSort>
          );
        },

        cell: ({ row }) => formatDate(row.getValue("receiptDate")),
      },
      {
        accessorKey: "referenceNo",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Reference
            </ColumnSort>
          );
        },
      },
      {
        accessorKey: "totalAmount",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
              align="right"
            >
              Total Amount
            </ColumnSort>
          );
        },
        meta: {
          headerClassName: "justify-end",
          className: "text-right",
        },
        cell: ({ row }) => {
          const { totalAmount, totalReturnAmount } = row.original;

          return (
            <div
              className={cx({ "text-red-500": Number(totalReturnAmount) > 0 })}
            >
              {formatCurrency(Number(totalAmount) - Number(totalReturnAmount))}
            </div>
          );
        },
      },
    ],
    [filter, handleFilterChange],
  );
  return (
    <div>
      <Card>
        <CardHeader className="px-2 md:px-4">
          <CardTitle className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="bg-border h-5 w-[1px]"></div>
            Good Receipts
          </CardTitle>
          <CardAction>
            <Link to={ROUTES.GOOD_RECEIPT_CREATE}>
              <Button className="shadow-md bg-orange-500">
                <Plus /> Create Order
              </Button>
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-2 md:px-4">
          <SectionCards data={data.summary || []} />

          <div className="flex flex-col md:flex-row gap-2  ">
            <div>
              <DateRangePicker value={range} onChange={setRange} />
            </div>

            <Input
              placeholder="Search Reference"
              className="w-full"
              value={filter.q}
              onChange={(e) => {
                setFilter((prev) => ({
                  ...prev,
                  q: e.target.value,
                }));
                setFilter((prev) => ({ ...prev, page: 1 }));
              }}
            />
            <Select
              options={ORDER_STATUS_OPTIONS}
              value={filter.status}
              onChange={(selected) => {
                if (selected === "ALL") {
                  setFilter(({ ...prev }) => ({ ...prev, status: "ALL" }));
                } else {
                  setFilter((prev) => ({ ...prev, status: selected }));
                }
              }}
            />
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <DataTable
                data={data.data || []}
                columns={columns}
                onRowClick={(item: GoodReceipt) =>
                  navigate(`${ROUTES.GOOD_RECEIPT}/${item.id}`)
                }
              />
              {data.meta.totalPages > 1 && (
                <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
