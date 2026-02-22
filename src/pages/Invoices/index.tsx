import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PAGINATION,
  PAGINATION_RESPONSE,
  ROUTES,
  STATUS_COLOR,
} from "@/utils/definitions";
import { filterProps, Invoice, PaginatedResponse } from "@/schemas";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { TableCell, TableRow } from "@/components/ui/table";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColumnSort from "@/components/ColumnSort";
import ColorBadge from "@/components/ColorBadge";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { invoiceServices } from "@/services";
import useToggle from "@/hooks/useToggle";
import InvoiceModal from "./InvoiceModal";
import Pager from "@/components/Pager";
import { Plus } from "lucide-react";
import React from "react";

export default function Invoices() {
  const navigate = useNavigate();
  const [toggle, handleToggle] = useToggle({
    addInvoiceModal: false,
  });
  const [data, setData] =
    React.useState<PaginatedResponse<Invoice>>(PAGINATION_RESPONSE);

  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "id",
    order: "DESC",
    q: "",
  });

  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await invoiceServices.getAll(filter);
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

  const columns: ColumnDef<Invoice>[] = React.useMemo(
    () => [
      {
        accessorKey: "invoiceNumber",
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="bg-border h-5 w-[1px]"></div>
          Invoices
        </CardTitle>
        <CardAction>
          <Button
            className="shadow-sm"
            onClick={() => {
              handleToggle({ addInvoiceModal: true });
            }}
          >
            <Plus /> Create Invoice
          </Button>
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
              onRowClick={(item: Invoice) => {
                if (item.status === "DRAFT") {
                  handleToggle({
                    addInvoiceModal: true,
                  });
                } else {
                  navigate(`${ROUTES.INVOICES}/${item.id}`);
                }
              }}
              data={data.data || []}
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
            {data.meta.totalPages > 1 && (
              <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
            )}
          </>
        )}
      </CardContent>
      {toggle.addInvoiceModal && (
        <InvoiceModal
          isOpen={true}
          onClose={(reload) => {
            handleToggle({ addInvoiceModal: false });
            if (reload) {
              getData();
            }
          }}
        />
      )}
    </Card>
  );
}
