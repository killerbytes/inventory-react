import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PAGINATION, ROUTES, STATUS_COLOR } from "@/utils/definitions";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { Customer, Invoice, PaginatedResponse } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { invoiceServices } from "@/services";
import { useNavigate } from "react-router";
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
  const [selected, setSelected] = React.useState<Invoice>();
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<PaginatedResponse<Customer[]>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });

  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "createdAt",
    order: "asc",
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

  React.useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      page,
    }));
  }, [page]);

  const columns: ColumnDef<Invoice>[] = React.useMemo(
    () => [
      {
        accessorKey: "invoiceNumber",
        header: "Invoice Number",
      },
      {
        accessorKey: "supplier.name",
        header: "Supplier",
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
        header: "Invoice Date",
        cell: ({ row }) => formatDate(row.getValue("invoiceDate")),
      },
      {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: ({ row }) => formatDate(row.getValue("dueDate")),
      },
      {
        accessorKey: "totalAmount",
        header: () => "Total Amount",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },
        cell: ({ row }) => formatCurrency(row.getValue("totalAmount")),
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
          Invoices
        </CardTitle>
        <CardAction>
          <Button
            className="shadow-sm"
            onClick={() => {
              setSelected(undefined);
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
                  setSelected(item);
                } else {
                  navigate(`${ROUTES.INVOICES}/${item.id}`);
                }
              }}
              data={data.data || []}
              columns={columns}
              showFooter={true}
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
            <Pager data={data} page={page} setPage={setPage} />
          </>
        )}
      </CardContent>
      {toggle.addInvoiceModal && (
        <InvoiceModal
          data={selected}
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
