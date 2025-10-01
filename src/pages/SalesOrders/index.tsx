import {
  MODE_OF_PAYMENT_COLOR,
  ORDER_STATUS,
  ORDER_STATUS_OPTIONS,
  PAGINATION,
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
import { filterProps, PaginatedResponse, SalesOrder } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { TableCell, TableRow } from "@/components/ui/table";
import DateRangePicker from "@/components/DateRangePicker";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { endOfMonth, startOfMonth } from "date-fns";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { mappedStatusHistory } from "@/lib/utils";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import SalesOrderModal from "./SalesOrderModal";
import { salesOrderServices } from "@/services";
import { useNavigate } from "react-router-dom";
import useToggle from "@/hooks/useToggle";
import Select from "@/components/Select";
import Pager from "@/components/Pager";
import { Plus } from "lucide-react";
import React from "react";

export default function SalesOrders() {
  const navigate = useNavigate();
  const [data, setData] = React.useState<PaginatedResponse<SalesOrder[]>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });
  const [selected, setSelected] = React.useState<SalesOrder>();
  const [loading, setLoading] = React.useState(true);
  const [range, setRange] = React.useState({
    // from: startOfMonth(new Date()),
    // to: endOfMonth(new Date()),
  });
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    order: "DESC",
    sort: "deliveryDate",
    // ...(range?.from && range?.to && { startDate: range.from.toISOString() }),
    // ...(range?.from && range?.to && { endDate: range.to.toISOString() }),
  });
  const [toggle, handleToggle] = useToggle({
    salesOrderModal: false,
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
        ...(range?.from && range?.to && { startDate: range.from }),
        ...(range?.from && range?.to && { endDate: range.to }),

        status: filter.status === "ALL" ? undefined : filter.status,
      };

      const data: PaginatedResponse<SalesOrder[]> =
        await salesOrderServices.getAll(payload);
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

  const columns: ColumnDef<SalesOrder>[] = [
    {
      accessorKey: "salesOrderNumber",
      header: "PO #",
    },
    {
      accessorKey: "deliveryDate",
      header: "Order Date",
      cell: ({ row }) => formatDate(row.getValue("deliveryDate")),
    },
    {
      accessorKey: "customer.name",
      header: "Customer",
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
    // {
    //   accessorKey: "statusHistory",
    //   header: "Date",
    //   cell: ({ row }) => {
    //     const statusHistoryMap = mappedStatusHistory(
    //       row.original.salesOrderStatusHistory ?? [],
    //     );
    //     return formatDate(statusHistoryMap[row.original.status]?.changedAt);
    //   },
    // },

    {
      accessorKey: "modeOfPayment",
      header: "Payment Mode",
      meta: {
        headerClassName: "text-center",
        className: "text-center",
      },
      cell: ({ row }) => {
        return (
          <ColorBadge colorMap={MODE_OF_PAYMENT_COLOR}>
            {String(row.original.modeOfPayment)}
          </ColorBadge>
        );
      },
    },
    {
      accessorKey: "user.username",
      header: "User",
      cell: ({ row }) => {
        const statusHistoryMap = mappedStatusHistory(
          row.original.salesOrderStatusHistory ?? [],
        );
        return statusHistoryMap[row.original.status]?.user.username;
      },
    },
    {
      accessorKey: "totalAmount",
      header: () => "Total Amount",
      meta: {
        headerClassName: "text-right",
        className: "text-right",
      },
      cell: ({ row }) => formatCurrency(row.getValue("totalAmount")),
    },
  ];

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="bg-border h-5 w-[1px]"></div>
            Sales Orders
          </CardTitle>
          <CardAction>
            <Button
              className="shadow-md bg-green-500"
              onClick={() => {
                setSelected(undefined);
                handleToggle({ salesOrderModal: true });
              }}
            >
              <Plus /> Create Order
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 justify-between">
            <div>
              <DateRangePicker
                className="mb-4"
                value={range}
                onChange={setRange}
              />
            </div>
            <div className="w-1/4">
              <Select
                options={ORDER_STATUS_OPTIONS}
                value={ORDER_STATUS_OPTIONS[0].value}
                onChange={(selected) => {
                  if (selected === "ALL") {
                    setFilter(({ ...prev }) => ({ ...prev, status: "" }));
                  } else {
                    setFilter((prev) => ({ ...prev, status: selected }));
                  }
                }}
              />
            </div>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <DataTable
                data={data.data || []}
                columns={columns}
                onRowClick={(item: SalesOrder) => {
                  if (item.status === ORDER_STATUS.DRAFT) {
                    setSelected(item);
                    handleToggle({
                      salesOrderModal: true,
                    });
                  } else {
                    navigate(`${ROUTES.SALES_ORDERS}/${item.id}`);
                  }
                }}
                showFooter
                renderFooter={(data: SalesOrder[]) => {
                  return (
                    <TableRow>
                      <TableCell>Total Amount</TableCell>
                      <TableCell colSpan={7} className="text-right">
                        {formatCurrency(
                          data.reduce(
                            (acc: number, item: SalesOrder) =>
                              acc + parseFloat(item.totalAmount ?? "0"),
                            0,
                          ),
                        )}
                      </TableCell>
                    </TableRow>
                  );
                }}
              />
              {data.totalPages > 1 && (
                <Pager data={data} filter={filter} setFilter={setFilter} />
              )}
            </>
          )}
        </CardContent>
      </Card>
      {toggle.salesOrderModal && (
        <SalesOrderModal
          data={selected as SalesOrder}
          isOpen={toggle.salesOrderModal}
          onClose={(reload = false) => {
            if (reload) {
              getData();
            }
            handleToggle({
              salesOrderModal: false,
            });
          }}
        />
      )}
    </div>
  );
}
