import { useGoodReceiptBySupplier } from "@/features/good-receipts/hooks/useGoodReceipts";
import { ORDER_STATUS, PAGINATION, STATUS_COLOR } from "@/utils/definitions";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { filterProps, InvoiceGoodReceipt } from "@/schemas";
import { DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import SummaryCard from "@/components/SummaryCard";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import Loader from "@/components/Loader";
import Pager from "@/components/Pager";
import Modal from "@/components/Modal";
import React from "react";

export default function GoodReceiptPickerModal({
  isOpen,
  onClose,
  supplierId,
  onSubmit,
  defaultSelected,
}: {
  isOpen: boolean;
  onClose: () => void;
  supplierId: number;
  onSubmit: (selected: InvoiceGoodReceipt[]) => void;
  defaultSelected: InvoiceGoodReceipt[];
}) {
  const [selected, setSelected] = React.useState<InvoiceGoodReceipt[]>([]);

  const [filter, setFilter] = React.useState<filterProps>({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    status: "ALL",
    sort: "id",
    order: "DESC",
    q: "",
  });

  const { data, isLoading } = useGoodReceiptBySupplier(
    {
      ...filter,
      status: ORDER_STATUS.RECEIVED,
    },
    Number(supplierId),
  );

  const columns: ColumnDef<InvoiceGoodReceipt>[] = React.useMemo(
    () => [
      {
        accessorKey: "selected",
        header: ({ table }) => {
          return (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.getToggleAllPageRowsSelectedHandler()({
                  target: { checked: !!value },
                })
              }
              aria-label="Select all"
            />
          );
        },
        meta: {
          className: "w-0",
        },
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) =>
              row.getToggleSelectedHandler()({ target: { checked: !!value } })
            }
            aria-label="Select row"
          />
        ),
      },
      {
        accessorKey: "referenceNo",
        header: "Reference",
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
        header: "Receipt Date",
        accessorKey: "receiptDate",
        cell: ({ row }) => formatDate(row.getValue("receiptDate")),
      },

      {
        accessorKey: "totalAmount",
        header: () => "Total Amount",
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
    [],
  );

  const handleSelectionChange = React.useCallback(
    (items: InvoiceGoodReceipt[]) => {
      setSelected(items);
    },
    [],
  );

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} title="Select Good Receipts">
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            {data?.summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xl">
                <SummaryCard
                  label={data.summary.totalAmount.label}
                  value={formatCurrency(data.summary.totalAmount.value)}
                />
              </div>
            )}
            <div className="overflow-auto w-full grid gap-2 max-h-[300px]">
              <DataTable
                data={data?.data || []}
                columns={columns}
                defaultSelected={defaultSelected}
                onSelectionChange={handleSelectionChange}
              />
            </div>

            {data && data.meta.totalPages > 1 && (
              <Pager meta={data.meta} filter={filter} setFilter={setFilter} />
            )}
          </>
        )}
        <DialogFooter>
          <Button
            className="shadow-sm"
            type="submit"
            disabled={!selected.length}
            onClick={() => onSubmit(selected)}
          >
            Select
          </Button>
        </DialogFooter>
      </div>
    </Modal>
  );
}
