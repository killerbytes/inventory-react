import React from "react";

import {
  inventoryServices,
  type APIResponse,
  type Filter,
  type InventoryTransaction,
} from "@/services";
import {
  PAGINATION,
  ROUTES,
  TRANSACTION_TYPE,
  TRANSACTION_TYPE_OPTIONS,
} from "@/utils/definitions";
import { formatDateTime } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import SelectComponent from "@/components/Select";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MoveLeft } from "lucide-react";
import Pager from "@/components/Pager";

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
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    q: "",
  });

  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await inventoryServices.transactions(filter);
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

  const columns: ColumnDef<InventoryTransaction>[] = [
    {
      accessorKey: "orderId",
      header: "Order",
      meta: {
        className: "text-center font-medium",
      },
      cell: ({ row }) => {
        return (
          <Link
            to={`${row.getValue("orderType") === "SALES" ? ROUTES.SALES_ORDERS : ROUTES.PURCHASE_ORDERS}/${row.getValue("orderId")}`}
          >
            {row.getValue("orderId")}
          </Link>
        );
      },
    },
    {
      accessorKey: "inventory.product.name",
      header: "Name",
    },
    {
      accessorKey: "previousValue",
      header: () => <div className="text-right">Previous Value</div>,
      meta: {
        className: "text-right",
      },
    },
    {
      accessorKey: "value",
      header: () => <div className="text-right">Value</div>,
      meta: {
        className: "text-right",
      },
    },
    {
      accessorKey: "newValue",
      header: () => <div className="text-right">New Value</div>,
      meta: {
        className: "text-right",
      },
    },
    // {
    //   accessorKey: "orderType",
    //   header: () => <div className="text-center">Order Type</div>,
    //   meta: {
    //     className: "text-center",
    //   },
    //   cell: ({ row }) => {
    //     return (
    //       <Link
    //         to={`${row.getValue("orderType") === "SALES" ? ROUTES.SALES_ORDERS : ROUTES.PURCHASE_ORDERS}/${row.getValue("orderId")}`}
    //       >
    //         {row.getValue("orderId")}
    //       </Link>
    //     );
    //   },
    // },
    {
      accessorKey: "transactionType",
      header: "Transaction Type",
      meta: {
        className: "text-center",
      },
      cell: ({ row }) => {
        return (
          <Badge
            className={cx("text-xs", {
              "bg-red-500":
                row.getValue("transactionType") ===
                TRANSACTION_TYPE.CANCELLATION,
              "bg-green-500":
                row.getValue("transactionType") === TRANSACTION_TYPE.PURCHASE,
              "bg-yellow-500":
                row.getValue("transactionType") === TRANSACTION_TYPE.SALE,
            })}
          >
            {row.getValue("transactionType")}
          </Badge>
        );
      },
    },

    {
      accessorKey: "updatedAt",
      header: "Updated At",
      className: "text-right",
      cell: ({ row }) => formatDateTime(row.getValue("updatedAt")),
    },
  ];

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

      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear mb-4">
        <div className="flex w-full items-center px-2">
          <h1 className="font-medium">Inventory History</h1>
        </div>
      </header>
      <div>
        <Input
          placeholder="Search history"
          className="w-full mb-4"
          value={filter.q}
          onChange={(e) => {
            setFilter((prev) => ({
              ...prev,
              q: e.target.value,
            }));
          }}
        />
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <SelectComponent
            options={TRANSACTION_TYPE_OPTIONS}
            onChange={(selected) => {
              if (selected.value === "ALL") {
                setFilter(({ transactionType, ...prev }) => ({ ...prev }));
              } else {
                setFilter((prev) => ({
                  ...prev,
                  transactionType: selected.value,
                }));
              }
            }}
          />

          <DataTable
            data={data.data || []}
            columns={columns}
            // onRowClick={(item) => navigate(`/purchases/${item.id}`)}
          ></DataTable>

          {/* <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-auto">Order</TableHead>
                <TableHead className="w-auto">Name</TableHead>
                <TableHead className="text-right">Previous Value</TableHead>
                <TableHead className="text-right">New Value</TableHead>
                <TableHead className="text-right">Order Type</TableHead>
                <TableHead className="text-right">Transaction Type</TableHead>
                <TableHead className="text-right">Last Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <Link
                      to={`${item.orderType === "SALES" ? ROUTES.SALES_ORDERS : ROUTES.PURCHASE_ORDERS}/${item.orderId}`}
                    >
                      {item.orderId}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.inventory.product.name}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.previousValue}
                  </TableCell>
                  <TableCell className="text-right">{item.newValue}</TableCell>
                  <TableCell className="text-right">{item.orderType}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      className={cx("text-xs", {
                        "bg-red-500":
                          item.transactionType ===
                          TRANSACTION_TYPE.CANCELLATION,
                        "bg-green-500":
                          item.transactionType === TRANSACTION_TYPE.PURCHASE,
                        "bg-yellow-500":
                          item.transactionType === TRANSACTION_TYPE.SALE,
                      })}
                    >
                      {item.transactionType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDateTime(item.updatedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table> */}

          <Pager data={data} page={page} setPage={setPage} />
        </>
      )}
    </div>
  );
}
