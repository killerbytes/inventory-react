import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PAGINATION, PAGINATION_RESPONSE, ROUTES } from "@/utils/definitions";
import { filterProps, PaginatedResponse } from "@/schemas/others";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { formatCurrency } from "@/utils/formatters";
import { Invoice } from "@/schemas/invoice.schema";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColumnSort from "@/components/ColumnSort";
import { PaymentApplication } from "@/schemas";
import { Input } from "@/components/ui/input";
import { paymentServices } from "@/services";
import Pager from "@/components/Pager";
import { Link } from "react-router";
import React from "react";

export default function Payments() {
  const [data, setData] =
    React.useState<PaginatedResponse<PaymentApplication>>(PAGINATION_RESPONSE);

  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "createdAt",
    order: "DESC",
    q: "",
  });

  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await paymentServices.getAll(filter);
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

  const handleFilterChange = React.useCallback((data: filterProps) => {
    setFilter((prevState) => ({ ...prevState, ...data }));
  }, []);

  const columns: ColumnDef<PaymentApplication>[] = React.useMemo(
    () => [
      {
        accessorKey: "payment.referenceNo",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
              sortKey="payment.referenceNo"
            >
              Reference No
            </ColumnSort>
          );
        },
      },
      {
        accessorKey: "invoice",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
              sortKey="invoice.invoiceNumber"
            >
              Invoice Number
            </ColumnSort>
          );
        },
        cell: ({ row }) => {
          const invoice = row.getValue("invoice") as Invoice;
          return (
            <Link
              to={`${ROUTES.INVOICES}/${invoice.id}`}
              className="text-primary"
            >
              {invoice.invoiceNumber}
            </Link>
          );
        },
      },
      {
        accessorKey: "payment.supplier.name",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
              sortKey="payment.supplier.name"
            >
              Supplier
            </ColumnSort>
          );
        },
        cell: ({
          row: {
            original: { payment },
          },
        }) => {
          return (
            <Link
              to={`${ROUTES.SUPPLIERS}/${payment.supplier?.id}`}
              className="text-primary"
            >
              {payment.supplier?.name}
            </Link>
          );
        },
      },
      {
        accessorKey: "payment.user.username",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
              sortKey="payment.user.username"
            >
              Changed By
            </ColumnSort>
          );
        },
      },
      {
        accessorKey: "amountApplied",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
              align="right"
            >
              Amount
            </ColumnSort>
          );
        },
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => formatCurrency(row.getValue("amountApplied")),
      },
    ],
    [filter, handleFilterChange],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="bg-border h-5 w-[1px]"></div>
          Payments
        </CardTitle>
        <CardAction>
          {/* <Button
            className="shadow-sm"
            onClick={() => {
              setSelected(undefined);
              handleToggle({ addInvoiceModal: true });
            }}
          >
            <Plus /> Create Invoice
          </Button> */}
        </CardAction>
      </CardHeader>
      <CardContent>
        <div>
          <Input
            placeholder="Search invoice"
            className="w-full mb-4"
            value={filter.q}
            onChange={(e) => {
              setFilter((prev) => ({
                ...prev,
                q: e.target.value,
                page: 1,
              }));
            }}
          />
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <DataTable data={data.data || []} columns={columns} />
            {data.meta.totalPages > 1 && (
              <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
