import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import services, { type APIResponse } from "../../services";
import { Toaster } from "@/components/ui/sonner";
import { Plus } from "lucide-react";
import Pager from "@/components/Pager";
import { Link, useNavigate } from "react-router-dom";
import formatCurrency from "@/utils";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cx } from "class-variance-authority";
import type { SalesOrder } from "@/services/salesOrder";

export default function SalesOrders() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<APIResponse<SalesOrder[]>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });

  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState({
    limit: 10,
    page: 1,
  });

  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await services.salesOrderServices.getAll(filter);
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

  React.useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      page,
    }));
  }, [page]);
  return (
    <div>
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center px-2">
          <h1 className="font-medium">Sales Orders</h1>

          <div className="ml-auto">
            <Link to="/sales/new">
              <Button>
                <Plus /> Add
              </Button>
            </Link>
          </div>
        </div>
      </header>
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
                    console.log(item.id);
                    navigate(`/sales/${item.id}`);
                  }}
                >
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.customer}</TableCell>
                  <TableCell>{item.receivedByUser.name}</TableCell>
                  <TableCell>{formatCurrency(item.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge
                      className={cx(
                        `capitalize status-${item.status.toLowerCase()}`
                      )}
                    >
                      {item.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(item.orderDate, "dd/MM/yy")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pager data={data} page={page} setPage={setPage} />
        </>
      )}

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
