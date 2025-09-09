import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Customer,
  Invoice,
  PaginatedResponse,
  PaymentApplication,
} from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { formatCurrency } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Link, useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/utils/definitions";
import { paymentServices } from "@/services";
import useToggle from "@/hooks/useToggle";
import Pager from "@/components/Pager";
import React from "react";

export default function Payments() {
  const [toggle, handleToggle] = useToggle({});
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<PaginatedResponse<Customer[]>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });

  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState({
    limit: 10,
    page: 1,
    sort: "createdAt",
    order: "asc",
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

  React.useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      page,
    }));
  }, [page]);

  const columns: ColumnDef<Invoice>[] = React.useMemo(
    () => [
      {
        accessorKey: "payment.referenceNo",
        header: "Reference No",
      },
      {
        accessorKey: "invoice",
        header: "Invoice Number",
        cell: ({ row }) => {
          const invoice = row.getValue("invoice") as Invoice;
          return (
            <Link to={`${ROUTES.INVOICES}/${invoice.id}`}>
              {invoice.invoiceNumber}
            </Link>
          );
        },
      },
      {
        accessorKey: "payment.supplier.name",
        header: "Supplier",
      },
      {
        accessorKey: "payment.user.username",
        header: "Changed By",
      },
      {
        accessorKey: "amountApplied",
        header: () => "Amount",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => formatCurrency(row.getValue("amountApplied")),
      },
    ],
    [],
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
            <DataTable
              data={data.data || []}
              columns={columns}
              showFooter={true}
              renderFooter={(rows: PaymentApplication[]) => {
                return (
                  <TableRow>
                    <TableCell colSpan={4} className="font-semibold">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(
                        rows.reduce(
                          (sum, row) => sum + Number(row.amountApplied),
                          0,
                        ),
                      )}
                    </TableCell>
                  </TableRow>
                );
              }}
            />
            <Pager data={data} page={page} setPage={setPage} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
