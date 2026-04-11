import { formatCurrency, formatDate } from "@/utils/formatters";
import { PriceHistory, ProductCombination } from "@/schemas";
import { productCombinationServices } from "@/services";
import { ColumnDef, Row } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import ColorBadge from "@/components/ColorBadge";
import { UNIT_COLOR } from "@/utils/definitions";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { useDropzone } from "react-dropzone";
import React, { useState } from "react";
import { toast } from "sonner";
import { last } from "lodash";
import Papa from "papaparse";

type PriceManagerData = ProductCombination & {
  newPrice: number;
  priceHistories?: PriceHistory[];
  isValid: boolean;
};

const PriceManager = () => {
  const [data, setData] = useState<PriceManagerData[]>([]);

  const onDrop = (acceptedFiles: any[]) => {
    const file = acceptedFiles[0];

    // PapaParse handles the file reading for you
    Papa.parse(file, {
      header: true, // Converts rows into objects using the first row as keys
      skipEmptyLines: true,
      complete: async (results: any) => {
        const filtered = results.data.filter((item: any) => item["NEW PRICE"]);
        const ids = filtered.map((item: any) => item.ID);
        const res = await productCombinationServices.getByIds(ids);

        const result = res.map((item: any) => {
          const matchingRow = filtered.find(
            (f: any) => Number(f.ID) === item.id,
          );
          let newPrice = parseFloat(
            matchingRow["NEW PRICE"].replace(/[^0-9.-]+/g, ""),
          );

          return {
            ...item,
            newPrice: newPrice,
            isValid: !isNaN(newPrice) && newPrice > 0,
          };
        });

        setData(result);
      },
      error: (error: any) => {
        console.error("Error parsing CSV:", error);
      },
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
  });

  const handleSubmit = async () => {
    try {
      await productCombinationServices.updatePrices(
        data.filter((item) => item.isValid),
      );
      toast.success("Prices updated successfully");
    } catch (error) {
      toast.error("Failed to update prices");
    }
  };

  const columns = React.useMemo<ColumnDef<PriceManagerData>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }: { row: Row<PriceManagerData> }) => (
          <div
            style={{
              paddingLeft: `${row.depth}rem`,
            }}
          >
            <div className="flex items-center gap-1">
              <ColorBadge colorMap={UNIT_COLOR}>{row.original.unit}</ColorBadge>
              {row.original.name}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "averagePrice",
        header: "Average Price",
        cell: ({ row }: { row: Row<PriceManagerData> }) => {
          return formatCurrency(Number(row.original.inventory.averagePrice));
        },
      },
      {
        accessorKey: "priceHistories.changedAt",
        header: "Last Changed At",
        cell: ({ row }: { row: Row<PriceManagerData> }) => {
          const changedAt = last(row.original.priceHistories)?.changedAt;
          return formatDate(changedAt);
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: { row: Row<PriceManagerData> }) => {
          return (
            <div
              className={cx("font-bold", {
                "text-red-500": row.original.price == 0,
              })}
            >
              {formatCurrency(row.original.price ?? 0)}
            </div>
          );
        },
      },

      {
        accessorKey: "newPrice",
        header: "New Price",
        cell: ({ row }: { row: Row<PriceManagerData> }) => {
          return (
            <div
              className={cx("font-bold", {
                "text-red-500":
                  row.original.newPrice > (row.original.price ?? 0),
                "text-green-500":
                  row.original.newPrice < (row.original.price ?? 0),
              })}
            >
              {row.original.newPrice
                ? formatCurrency(Number(row.original.newPrice))
                : "-"}
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <div
        {...getRootProps()}
        className="border-dashed border-2 border-gray-300 rounded-md p-10 text-center cursor-pointer bg-gray-50"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the CSV here...</p>
        ) : (
          <p>Drag & drop a CSV, or click to select</p>
        )}
      </div>

      <DataTable
        data={data}
        columns={columns}
        meta={{
          disabledRow: { isValid: false },
        }}
      />
      <div className="flex justify-end">
        <Button disabled={data.length === 0} onClick={handleSubmit}>
          Update Prices
        </Button>
      </div>
    </div>
  );
};

export default PriceManager;
