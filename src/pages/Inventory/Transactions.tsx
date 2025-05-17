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
import services, { type APIResponse, type Filter } from "../../services";
import Pager from "@/components/Pager";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router";
import { ROUTES } from "@/utils/definitions";
import type { Inventory } from ".";
import { MoveLeft } from "lucide-react";

export default function InventoryTransactions() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<APIResponse<InventoryTransaction[]>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });

  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<Filter>({
    limit: 10,
    page: 1,
  });

  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await services.inventoryServices.transactions(filter);
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
      <div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(ROUTES.INVENTORY)}
          className="mb-4"
        >
          <MoveLeft /> Back
        </Button>
      </div>

      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
        <div className="flex w-full items-center px-2">
          <h1 className="text-lg">History</h1>
        </div>
      </header>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-auto">Order</TableHead>
                <TableHead className="w-auto">Name</TableHead>
                <TableHead className="text-right">Previous Quantity</TableHead>
                <TableHead className="text-right">New Quantity</TableHead>
                <TableHead className="text-right">Transaction Type</TableHead>
                <TableHead className="text-right">Last Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <Link to={`${ROUTES.PURCHASE_ORDERS}/${item.orderId}`}>
                      {item.orderId}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.inventory.product.name}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.previousQuantity}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.newQuantity}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.transactionType}
                  </TableCell>
                  <TableCell className="text-right">
                    {format(item.updatedAt, "PPP")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pager data={data} page={page} setPage={setPage} />
        </>
      )}
    </div>
  );
}

export interface InventoryTransaction {
  id: number;
  inventory: Inventory;
  previousQuantity: number;
  newQuantity: number;
  transactionType: string;
  updatedAt: Date;
  orderId: number;
}
