import { formatCurrency, formatDate } from "@/utils/formatters";
import { TableCell, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/DataTable";
import { STATUS_COLOR } from "@/utils/definitions";
import { ColumnDef } from "@tanstack/react-table";
import ColorBadge from "@/components/ColorBadge";
import { goodReceiptServices } from "@/services";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import { GoodReceipt } from "@/types";
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
  onSubmit: (selected: GoodReceipt[]) => void;
  defaultSelected: GoodReceipt[];
}) {
  const [selected, setSelected] = React.useState([]);
  const [goodReceipts, setGoodReceipts] = React.useState<GoodReceipt[]>([]);
  React.useEffect(() => {
    const getData = async (id: number) => {
      const data: GoodReceipt[] = await goodReceiptServices.getBySupplier(id);
      setGoodReceipts(data.slice(0, 5));
    };
    if (supplierId) {
      getData(supplierId);
    }
  }, [supplierId]);

  const columns: ColumnDef<GoodReceipt>[] = React.useMemo(
    () => [
      {
        accessorKey: "selected",
        header: ({ table }) => {
          return (
            <Checkbox
              // The `checked` prop handles the "checked" and "indeterminate" states
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              // The `onCheckedChange` handler is provided by Tanstack Table
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
        cell: ({ row }) => formatCurrency(row.getValue("totalAmount")),
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
          onSelectionChange={React.useCallback((items) => {
            setSelected(items);
          }, [])}
          renderFooter={() => {
            return (
              <TableRow>
                <TableCell colSpan={4}>Total Amount: </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(
                    selected.reduce(
                      (acc: number, item: GoodReceipt) =>
                        acc + parseFloat(item.totalAmount ?? "0"),
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
          onClick={() => onSubmit(selected)}
        >
          Select
        </Button>
      </DialogFooter>
    </Modal>
  );
}
