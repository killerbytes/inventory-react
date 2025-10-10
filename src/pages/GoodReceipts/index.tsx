import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ORDER_STATUS_OPTIONS,
  PAGINATION,
  ROUTES,
  STATUS_COLOR,
} from "@/utils/definitions";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { TableCell, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import DateRangePicker from "@/components/DateRangePicker";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PaginatedResponse, GoodReceipt } from "@/types";
import { Link, useNavigate } from "react-router-dom";
import { endOfMonth, startOfMonth } from "date-fns";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { mappedStatusHistory } from "@/lib/utils";
import ColorBadge from "@/components/ColorBadge";
import { goodReceiptServices } from "@/services";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import Select from "@/components/Select";
import Pager from "@/components/Pager";
import React from "react";

export default function GoodReceipts() {
  const navigate = useNavigate();
  const [data, setData] = React.useState<PaginatedResponse<GoodReceipt[]>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });

  const [loading, setLoading] = React.useState(true);
  const [range, setRange] = React.useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [filter, setFilter] = React.useState({
    status: "ALL",
    sort: "id",
    order: "DESC",
    q: "",
    // ...(range?.from && range?.to && { startDate: range.from.toISOString() }),
    // ...(range?.from && range?.to && { endDate: range.to.toISOString() }),
  });
  const [tableFilters, setTableFilters] = React.useState({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
  });
  // React.useEffect(() => {
  //   const { from, to } = range || {};
  //   if (from && to) {
  //     setFilter((prev) => ({
  //       ...prev,
  //       startDate: from.toISOString(),
  //       endDate: to.toISOString(),
  //     }));
  //   } else {
  //     setFilter((prev) => ({
  //       ...prev,
  //       startDate: "",
  //       endDate: "",
  //     }));
  //   }
  // }, [range]);

  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        ...filter,
        ...tableFilters,
        ...(range?.from && range?.to && { startDate: range.from }),
        ...(range?.from && range?.to && { endDate: range.to }),

        status: filter.status === "ALL" ? undefined : filter.status,
      };
      const data: PaginatedResponse<GoodReceipt[]> =
        await goodReceiptServices.getAll(payload);
      setData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [filter, range.from, range.to, tableFilters]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  const handleFilterChange = React.useCallback((data) => {
    setFilter((prevState) => ({ ...prevState, ...data }));
  }, []);

  // React.useEffect(() => {
  //   setFilter((prev) => ({
  //     ...prev,
  //     page,
  //   }));
  // }, [page]);

  const columns: ColumnDef<GoodReceipt>[] = React.useMemo(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => {
          return (
            <span
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                handleFilterChange({
                  order: filter.order === "ASC" ? "DESC" : "ASC",
                  sort: column.id,
                });
              }}
            >
              ID
              {filter.sort === column.id && filter.order === "ASC" ? (
                <ChevronUp />
              ) : (
                filter.sort === column.id && <ChevronDown />
              )}
            </span>
          );
        },
      },
      {
        accessorKey: "supplier.name",
        header: "Supplier",
      },
      {
        accessorKey: "status",
        header: "Status",
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
            <span
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                handleFilterChange({
                  order: filter.order === "ASC" ? "DESC" : "ASC",
                  sort: column.id,
                });
              }}
            >
              Receipt Date
              {filter.sort === column.id && filter.order === "ASC" ? (
                <ChevronUp />
              ) : (
                filter.sort === column.id && <ChevronDown />
              )}
            </span>
          );
        },

        cell: ({ row }) => formatDate(row.getValue("receiptDate")),
      },
      {
        accessorKey: "referenceNo",
        header: ({ column }) => {
          return (
            <span
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                handleFilterChange({
                  order: filter.order === "ASC" ? "DESC" : "ASC",
                  sort: column.id,
                });
              }}
            >
              Reference
              {filter.sort === column.id && filter.order === "ASC" ? (
                <ChevronUp />
              ) : (
                filter.sort === column.id && <ChevronDown />
              )}
            </span>
          );
        },
      },
      {
        accessorKey: "totalAmount",
        header: ({ column }) => {
          return (
            <span
              className={cx(
                "flex items-center gap-2 cursor-pointer",
                column.columnDef.meta?.headerClassName,
              )}
              onClick={() => {
                handleFilterChange({
                  order: filter.order === "ASC" ? "DESC" : "ASC",
                  sort: column.id,
                });
              }}
            >
              Total Amount
              {filter.sort === column.id && filter.order === "ASC" ? (
                <ChevronUp />
              ) : (
                filter.sort === column.id && <ChevronDown />
              )}
            </span>
          );
        },
        meta: {
          headerClassName: "justify-end",
          className: "text-right",
        },
        cell: ({ row }) => formatCurrency(row.getValue("totalAmount")),
      },
    ],
    [filter.order, handleFilterChange],
  );
  return (
    <div>
      <Card>
        <CardHeader>
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
        <CardContent>
          <div className="flex gap-2 justify-between">
            <Input
              placeholder="Search Reference"
              className="w-full mb-4"
              value={filter.q}
              onChange={(e) => {
                setFilter((prev) => ({
                  ...prev,
                  q: e.target.value,
                }));
                setTableFilters((prev) => ({ ...prev, page: 1 }));
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
            <DateRangePicker
              className="mb-4"
              value={range}
              onChange={(e) => {
                console.log(e);
                setRange(e);
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
                showFooter
                renderFooter={(data: GoodReceipt[]) => {
                  return (
                    <TableRow className="font-bold">
                      <TableCell>Total Amount</TableCell>
                      <TableCell colSpan={10} className="text-right">
                        {formatCurrency(
                          data.reduce(
                            (acc: number, item: GoodReceipt) =>
                              acc + Number(item.totalAmount ?? "0"),
                            0,
                          ),
                        )}
                      </TableCell>
                    </TableRow>
                  );
                }}
              />
              <Pager
                data={data}
                filter={tableFilters}
                setFilter={setTableFilters}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
