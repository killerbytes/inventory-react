import { ORDER_STATUS, STATUS_COLOR } from "@/utils/definitions";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { TableCell, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { goodReceiptServices } from "@/services";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { InvoiceGoodReceipt } from "@/types";
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
  const [goodReceipts, setGoodReceipts] =
    React.useState<InvoiceGoodReceipt[]>(defaultSelected);

  React.useEffect(() => {
    const getData = async (id: number) => {
      const data: InvoiceGoodReceipt[] =
        await goodReceiptServices.getBySupplier(id, {
          status: ORDER_STATUS.RECEIVED,
        });
      setGoodReceipts(data);
    };
    if (supplierId) {
      getData(supplierId);
    }
  }, [supplierId]);

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
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} title="Add Invoice">
      <ScrollArea
        className="h-[280px]  rounded-md border"
        tabIndex={-1}
        autoFocus={false}
      >
        <DataTable
          data={goodReceipts}
          columns={columns}
          showFooter={true}
          defaultSelected={defaultSelected}
          onSelectionChange={React.useCallback(
            (items: InvoiceGoodReceipt[]) => {
              setSelected(items);
            },
            [],
          )}
          renderFooter={() => {
            return (
              <TableRow>
                <TableCell colSpan={4}>Total Amount: </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(
                    selected.reduce(
                      (acc: number, item: InvoiceGoodReceipt) =>
                        acc +
                        Number(item.totalAmount) -
                        Number(item.totalReturnAmount),
                      0,
                    ),
                  )}
                </TableCell>
              </TableRow>
            );
          }}
        />
      </ScrollArea>
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
    </Modal>
  );
}
