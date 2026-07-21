import { useInvoicesPaginated } from "@/features/invoices/hooks/useInvoices";
import InvoiceModal from "@/features/invoices/components/InvoiceModal";
import { PAGINATION, ROUTES, STATUS_COLOR } from "@/utils/definitions";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { TableCell, TableRow } from "@/components/ui/table";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import PageHeader from "@/components/PageHeader";
import ColumnSort from "@/components/ColumnSort";
import ColorBadge from "@/components/ColorBadge";
import { Link, useNavigate } from "react-router";
import { filterProps, Invoice } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useToggle from "@/hooks/useToggle";
import Loader from "@/components/Loader";
import Pager from "@/components/Pager";
import { Plus } from "lucide-react";
import React from "react";

export default function Invoices() {
  const navigate = useNavigate();
  const [toggle, handleToggle] = useToggle({
    addInvoiceModal: false,
  });

  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "id",
    order: "DESC",
    q: "",
  });
  const { data, isLoading } = useInvoicesPaginated(filter);

  const handleFilterChange = React.useCallback((data: filterProps) => {
    setFilter((prevState) => ({ ...prevState, ...data }));
  }, []);

  const columns: ColumnDef<Invoice>[] = React.useMemo(
    () => [
      {
        accessorKey: "invoiceNumber",
        meta: {
          className: "truncate max-w-40",
        },
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
              sortKey="invoiceNumber"
            >
              Invoice Number
            </ColumnSort>
          );
        },
      },
      {
        accessorKey: "supplier.name",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
              sortKey="supplier.name"
            >
              Supplier
            </ColumnSort>
          );
        },
        cell: ({
          row: {
            original: { supplier },
          },
        }) => {
          return (
            <Link
              to={`${ROUTES.SUPPLIERS}/${supplier?.id}`}
              className="text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              {supplier?.name}
            </Link>
          );
        },
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

      {
        accessorKey: "invoiceDate",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Invoice Date
            </ColumnSort>
          );
        },
        cell: ({ row }) => formatDate(row.getValue("invoiceDate")),
      },
      {
        accessorKey: "dueDate",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Due Date
            </ColumnSort>
          );
        },
        cell: ({ row }) => formatDate(row.getValue("dueDate")),
      },
      {
        accessorKey: "totalAmount",
        header: ({ column }) => {
          return (
            <ColumnSort
              filter={filter}
              handleFilterChange={handleFilterChange}
              column={column}
            >
              Total Amount
            </ColumnSort>
          );
        },
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => formatCurrency(row.getValue("totalAmount")),
      },
    ],
    [filter, handleFilterChange],
  );

  return (
    <>
      <PageHeader title="Invoices">
        <Button
          className="shadow-sm"
          onClick={() => {
            handleToggle({ addInvoiceModal: true });
          }}
        >
          <Plus /> Create Invoice
        </Button>
      </PageHeader>
      <Input
        placeholder="Search invoice"
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
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <DataTable
            onRowClick={(item: Invoice) => {
              if (item.status === "DRAFT") {
                handleToggle({
                  addInvoiceModal: true,
                });
              } else {
                navigate(`${ROUTES.INVOICES}/${item.id}`);
              }
            }}
            data={data?.data || []}
            columns={columns}
            renderFooter={(rows: Invoice[]) => {
              return (
                <TableRow>
                  <TableCell className="font-medium text-right" colSpan={5}>
                    Total
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(
                      rows.reduce(
                        (acc, curr) => acc + Number(curr.totalAmount),
                        0,
                      ),
                    )}
                  </TableCell>
                </TableRow>
              );
            }}
          />
          {data && data.meta.totalPages > 1 && (
            <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
          )}
        </>
      )}
      {toggle.addInvoiceModal && (
        <InvoiceModal
          isOpen={true}
          onClose={() => {
            handleToggle({ addInvoiceModal: false });
          }}
        />
      )}
    </>
  );
}
