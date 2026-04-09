import { CellContext, ColumnDef, HeaderContext } from "@tanstack/react-table";
import { DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/DataTable";
import BarcodeComponent from "./BarcodeComponent";
import ColorBadge from "@/components/ColorBadge";
import { UNIT_COLOR } from "@/utils/definitions";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { ProductCombination } from "@/schemas";
import Modal from "@/components/Modal";
import React from "react";

export default function BarcodePrinter({
  onClose,
  isOpen,
  items,
}: {
  onClose: () => void;
  isOpen: boolean;
  items: ProductCombination[];
}) {
  const contentRef = React.useRef(null);
  const [selectedItems, setSelectedItems] =
    React.useState<ProductCombination[]>(items);

  const pageStyle = `
    @page {
      // size: A4;
      margin: 5mm 10mm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .data-table-container{
        border: none;
      }
      tr {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      thead {
        display: none !important;
      }
    }
  `;

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: "Product-Barcodes",
    pageStyle: pageStyle,
  });

  const columns: ColumnDef<ProductCombination>[] = [
    {
      id: "select",
      meta: {
        headerClassName: "w-auto",
        className: "w-0",
      },
      header: ({ table }: HeaderContext<ProductCombination, unknown>) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => {
            console.log(value);

            table.toggleAllPageRowsSelected(!!value);
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: CellContext<ProductCombination, unknown>) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    },

    {
      accessorKey: "name",
      header: "Name",
      meta: {
        headerClassName: "print:hidden",
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-xs">
          <ColorBadge colorMap={UNIT_COLOR}>{row.original.unit}</ColorBadge>
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "barcode",
      header: "Barcode",
      meta: {
        headerClassName: "text-center print:hidden",
        className: "text-center w-10",
      },
      cell: ({ row }) => (
        <BarcodeComponent
          className="text-right"
          label={row.original.sku}
          value={String(row.original.barcode)}
        />
      ),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Print Barcode"
      description="Print barcode for the product"
      size="lg"
    >
      <div className="max-h-[80vh] overflow-y-auto ">
        <div ref={contentRef} className="print-container flex flex-col">
          <div className="print:hidden">
            <DataTable
              data={items}
              columns={columns}
              defaultSelected={items}
              onSelectionChange={(selectedItems) => {
                setSelectedItems(selectedItems);
              }}
            />
          </div>

          {/* Print Layout: 3 Columns Grid */}
          <div className="hidden print:grid print:grid-cols-3 gap-x-4 gap-y-2">
            {selectedItems.map((item, index) => (
              <div
                key={index}
                className="flex flex-col  items-center justify-between border-b border-gray-200 pb-2 break-inside-avoid"
                style={{ pageBreakInside: "avoid" }}
              >
                <div className="flex items-center gap-1 text-[10px]">
                  <ColorBadge
                    className="text-[8px] px-1 py-0"
                    colorMap={UNIT_COLOR}
                  >
                    {item.unit}
                  </ColorBadge>
                  <span className="">{item.name}</span>
                </div>
                <BarcodeComponent
                  label={item.sku}
                  value={String(item.barcode)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button onClick={handlePrint}>Print Barcode</Button>
      </DialogFooter>
    </Modal>
  );
}
