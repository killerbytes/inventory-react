import {
  MODE_OF_PAYMENT_COLOR,
  ORDER_STATUS,
  ORDER_STATUS_OPTIONS,
  PAGINATION,
  PAGINATION_RESPONSE,
  ROUTES,
  STATUS_COLOR,
} from "@/utils/definitions";
import { useSalesOrdersPaginated } from "@/features/sales-orders/hooks/useSalesOrders";
import SalesOrderModal from "../../features/sales-orders/components/SalesOrderModal";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import OCRModal from "@/features/sales-orders/components/OCRModal";
import DateRangePicker from "@/components/DateRangePicker";
import SectionCards from "@/components/SectionCards";
import { filterProps, SalesOrder } from "@/schemas";
import { endOfMonth, startOfMonth } from "date-fns";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { mappedStatusHistory } from "@/lib/utils";
import PageHeader from "@/components/PageHeader";
import ColumnSort from "@/components/ColumnSort";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cx } from "class-variance-authority";
import { DateRange } from "react-day-picker";
import { Camera, Plus } from "lucide-react";
import useToggle from "@/hooks/useToggle";
import Select from "@/components/Select";
import Loader from "@/components/Loader";
import Pager from "@/components/Pager";
import React from "react";

export default function SalesOrders() {
  const navigate = useNavigate();
  const [selected, setSelected] = React.useState<SalesOrder>();
  const [range, setRange] = React.useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    order: "DESC",
    sort: "orderDate",
    status: "ALL",
  });
  const payload = {
    ...filter,
    ...(range?.from && range?.to && { startDate: range.from }),
    ...(range?.from && range?.to && { endDate: range.to }),

    status: filter.status === "ALL" ? undefined : filter.status,
  };

  const { data = PAGINATION_RESPONSE, isLoading } =
    useSalesOrdersPaginated(payload);

  const [toggle, handleToggle] = useToggle({
    salesOrderModal: false,
    ocrModal: false,
  });

  const handleFilterChange = React.useCallback((data: filterProps) => {
    setFilter((prevState) => ({ ...prevState, ...data }));
  }, []);

  const columns: ColumnDef<SalesOrder>[] = [
    {
      accessorKey: "salesOrderNumber",
      header: ({ column }) => {
        return (
          <ColumnSort
            filter={filter}
            handleFilterChange={handleFilterChange}
            column={column}
          >
            Order #
          </ColumnSort>
        );
      },
    },
    {
      accessorKey: "orderDate",
      header: ({ column }) => {
        return (
          <ColumnSort
            filter={filter}
            handleFilterChange={handleFilterChange}
            column={column}
          >
            Order Date
          </ColumnSort>
        );
      },
      cell: ({ row }) => formatDateTime(row.getValue("orderDate")),
    },
    {
      accessorKey: "customer.name",
      header: ({ column }) => {
        return (
          <ColumnSort
            filter={filter}
            handleFilterChange={handleFilterChange}
            column={column}
            sortKey="customer.name"
          >
            Customer
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
        headerClassName: "text-right",
        className: "text-right",
      },
      cell: ({ row }) => {
        const { totalAmount, totalReturnAmount, totalExchangeAmount } =
          row.original;

        return (
          <div
            className={cx({ "text-red-500": Number(totalReturnAmount) > 0 })}
          >
            {formatCurrency(
              Number(totalAmount) -
                Number(totalReturnAmount) +
                Number(totalExchangeAmount),
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader title="Sales Orders">
        <Button
          className="shadow-md bg-red-500"
          onClick={() => {
            setSelected(undefined);
            handleToggle({ ocrModal: true });
          }}
        >
          <Camera />
        </Button>
        <Button
          className="shadow-md "
          onClick={() => {
            setSelected(undefined);
            handleToggle({ salesOrderModal: true });
          }}
        >
          <Plus /> Create Order
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-4 px-2 md:px-4">
        <SectionCards data={data.summary} />
        <div className="flex flex-col md:flex-row gap-2 ">
          <div>
            <DateRangePicker value={range} onChange={setRange} />
          </div>
          <div>
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
        </div>
        {isLoading ? (
          <Loader />
        ) : (
          <>
            <DataTable
              data={data.data || []}
              columns={columns}
              meta={{
                disabledRow: {
                  status: ORDER_STATUS.VOID,
                },
              }}
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
            />
            {data.meta.totalPages > 1 && (
              <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
            )}
          </>
        )}
      </div>
      {toggle.salesOrderModal && (
        <SalesOrderModal
          data={selected as SalesOrder}
          isOpen={toggle.salesOrderModal}
          onClose={() => {
            handleToggle({
              salesOrderModal: false,
            });
          }}
        />
      )}
      {toggle.ocrModal && (
        <OCRModal
          isOpen={toggle.ocrModal}
          onClose={() => {
            handleToggle({
              ocrModal: false,
            });
          }}
          onSubmit={() => {
            handleToggle({
              ocrModal: false,
              salesOrderModal: true,
            });
          }}
        />
      )}
    </>
  );
}
