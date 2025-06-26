import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

import {
  salesOrderServices,
  type APIResponse,
  type SalesOrder,
} from "@/services";
import {
  ORDER_STATUS,
  ORDER_STATUS_OPTIONS,
  PAGINATION,
} from "@/utils/definitions";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import DateRangePicker from "@/components/DateRangePicker";
import { Link, useNavigate } from "react-router-dom";
import { endOfMonth, startOfMonth } from "date-fns";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import Select from "@/components/Select";
import Pager from "@/components/Pager";
import { Plus } from "lucide-react";

export default function SalesOrders() {
  const navigate = useNavigate();
  const [range, setRange] = React.useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const [data, setData] = React.useState<APIResponse<SalesOrder[]>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });

  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    status: "",
  });

  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await salesOrderServices.getAll(filter);
      const data = response.data;
      setData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    getData();
  }, [filter, getData]);

  const totalCompletedAmount = React.useMemo(() => {
    return data.data?.reduce((acc, item) => {
      return item.status === ORDER_STATUS.COMPLETED
        ? acc + (parseFloat(item.totalAmount.toString()) || 0)
        : acc;
    }, 0);
  }, [data]);

  return (
    <div>
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear mb-4">
        <div className="flex w-full items-center px-2">
          <h1 className="font-medium">Sales Orders</h1>

          <div className="ml-auto">
            <Link to="/sales/new">
              <Button>
                <Plus /> Create Order
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <div className="flex justify-between items-centerflex flex-col-reverse gap-2 sm:flex-row sm:justify-end ">
        <div className="flex items-center gap-2">
          <h1>Total</h1>
          {formatCurrency(totalCompletedAmount)}
        </div>
        <DateRangePicker
          field={{
            value: range,
            onChange: setRange,
          }}
        />
      </div>

      <Select
        options={ORDER_STATUS_OPTIONS}
        onChange={(selected) => {
          if (selected === "ALL") {
            setFilter(({ status, ...prev }) => ({ ...prev }));
          } else {
            setFilter((prev) => ({ ...prev, status: selected }));
          }
        }}
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Name</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Received By</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data?.map((item) => (
                <TableRow
                  className="cursor-pointer"
                  key={item.id}
                  onClick={() => {
                    navigate(`/sales/${item.id}`);
                  }}
                >
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.customer}</TableCell>
                  <TableCell>{item.receivedByUser.name}</TableCell>
                  <TableCell>{formatCurrency(item.totalAmount)}</TableCell>
                  <TableCell>
                    {item.status && (
                      <Badge
                        className={cx(
                          `capitalize status-${item.status.toLowerCase()}`,
                        )}
                      >
                        {item.status.toLowerCase()}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDateTime(item.orderDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pager
            data={data}
            page={filter.page}
            setPage={(page) => {
              setFilter((prev) => ({
                ...prev,
                page,
              }));
            }}
          />
        </>
      )}

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
