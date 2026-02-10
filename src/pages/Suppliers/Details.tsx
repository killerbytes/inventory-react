import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ApiErrorResponse,
  filterProps,
  GoodReceipt,
  PaginatedResponse,
  Supplier,
} from "@/schemas";
import {
  PAGINATION,
  PAGINATION_RESPONSE,
  ROUTES,
  STATUS_COLOR,
} from "@/utils/definitions";
import { goodReceiptServices, supplierServices } from "@/services";
import { formatCurrency, formatDate } from "@/utils/formatters";
import SectionCards from "@/components/SectionCards";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColumnSort from "@/components/ColumnSort";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import Pager from "@/components/Pager";
import { toast } from "sonner";
import React from "react";

export default function SupplierDetails() {
  const { id } = useParams();
  const [data, setData] =
    React.useState<PaginatedResponse<GoodReceipt>>(PAGINATION_RESPONSE);
  const [supplier, setSupplier] = React.useState<Supplier>();
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "receiptDate",
    order: "DESC",
    q: "",
  });

  const getData = React.useCallback(async () => {
    try {
      const data: PaginatedResponse<GoodReceipt> =
        await goodReceiptServices.getBySupplier(Number(id), filter);

      setData(data);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error(apiError.message);
    }
  }, [filter, id]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  React.useEffect(() => {
    const getSupplier = async () => {
      const supplier = await supplierServices.get(Number(id));
      setSupplier(supplier);
    };
    getSupplier();
  }, [id]);

  const handleFilterChange = React.useCallback((data: filterProps) => {
    setFilter((prevState) => ({ ...prevState, ...data }));
  }, []);

  const columns: ColumnDef<GoodReceipt>[] = React.useMemo(
    () => [
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
        cell: ({ row }) => {
          return (
            <Link
              className="text-primary"
              to={ROUTES.GOOD_RECEIPT_DETAILS.replace(
                ":id",
                String(row.original.id),
              )}
            >
              {row.original.referenceNo}
            </Link>
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
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Date
            </ColumnSort>
          );
        },
        accessorKey: "receiptDate",
        cell: ({ row }) => formatDate(row.getValue("receiptDate")),
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
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{supplier?.name}</CardTitle>
          <CardDescription>
            {supplier?.address}
            <br />
            <p className="whitespace-pre">{supplier?.phone}</p>
          </CardDescription>
          <CardAction>
            <Button disabled>Create Invoice</Button>
          </CardAction>
        </CardHeader>
        <CardContent className="gap-4 flex flex-col">
          <SectionCards data={data.summary} />

          <Input
            placeholder="Search Reference"
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

          <DataTable data={data.data || []} columns={columns} />
          {data.meta.totalPages > 1 && (
            <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
