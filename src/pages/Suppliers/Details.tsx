import { useGoodReceiptBySupplier } from "@/features/good-receipts/hooks/useGoodReceipts";
import { PAGINATION, ROUTES, STATUS_COLOR } from "@/utils/definitions";
import { useSupplier } from "@/features/suppliers/hooks/useSuppliers";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { filterProps, GoodReceipt } from "@/schemas";
import SummaryCard from "@/components/SummaryCard";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import PageHeader from "@/components/PageHeader";
import ColumnSort from "@/components/ColumnSort";
import ColorBadge from "@/components/ColorBadge";
import { Link, useParams } from "react-router";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import Loader from "@/components/Loader";
import Pager from "@/components/Pager";
import React from "react";

export default function SupplierDetails() {
  const { id } = useParams();
  const { data: supplier } = useSupplier(Number(id));
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "receiptDate",
    order: "DESC",
    q: "",
  });

  const { data, isLoading } = useGoodReceiptBySupplier(filter, Number(id));

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
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <PageHeader
            title={supplier?.name}
            description={
              <>
                <div>{supplier?.address}</div>
                <p className="whitespace-pre">{supplier?.phone}</p>
              </>
            }
          >
            {/* <Button disabled>Create Invoice</Button> */}
          </PageHeader>
          {data?.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xl">
              <SummaryCard
                label={data.summary.totalAmount.label}
                value={formatCurrency(data.summary.totalAmount.value)}
              />
              <SummaryCard
                label={data.summary.totalReturnAmount.label}
                value={formatCurrency(data.summary.totalReturnAmount.value)}
              />
              <SummaryCard
                label={data?.summary.totalExchangeAmount.label}
                value={formatCurrency(data.summary.totalExchangeAmount.value)}
              />
            </div>
          )}

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

          <DataTable data={data?.data || []} columns={columns} />
          {data && data.meta.totalPages > 1 && (
            <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
          )}
        </>
      )}
    </>
  );
}
