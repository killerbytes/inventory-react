import { Product, ProductCombinations } from "@/types";
import { formatCurrency } from "@/utils/formatters";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { cx } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { PackageOpen } from "lucide-react";
import React from "react";

export default function CombinationItem({
  item,
  product,
}: {
  item: ProductCombinations;
  product: Product;
}) {
  console.log(item, product);
  const columns = React.useMemo<ColumnDef<ProductCombinations>[]>(
    () => [
      // {
      //   accessorKey: "sku",
      //   header: "SKU",
      //   meta: {
      //     className: "w-50",
      //   },
      // },
      ...product.variants.map((variant, idx) => ({
        accessorKey: "values.values." + variant.name,
        header: variant.name,
        cell: ({ row }: { row: Row<ProductCombinations> }) => {
          return row.original.values[idx]?.value;
        },
      })),
      {
        accessorKey: "price",
        header: "Price",
      },
      {
        header: "Quantity",
        accessorKey: "inventory.quantity",
      },
      {
        header: "Re-order Level",
        accessorKey: "reorderLevel",
      },
    ],
    [product.variants],
  );

  return (
    <>
      <DataTable data={item || []} columns={columns} />
    </>
    // <div
    //   className={cx(
    //     "flex  items-center px-4 py-1 hover:bg-gray-100 border border-t-0",
    //   )}
    // >
    //   {<PackageOpen size="16" color="green" className="ml-1" />}
    //   <div
    //     className={cx(
    //       "ml-1 flex items-center gap-2",
    //       "font-semibold",
    //       "text-primary",
    //     )}
    //   >
    //     <div className="text-muted-foreground">
    //       x {item.inventory?.quantity}
    //     </div>
    //   </div>
    //   <div className="flex gap-8 ml-auto items-center">
    //     <div className="flex gap-2 items-center">
    //       <Badge
    //         variant="outline"
    //         className={cx({
    //           "bg-red-100": Number(item.price) === 0,
    //         })}
    //       >
    //         {formatCurrency(item.price)}
    //       </Badge>
    //       {/* <div>{item.reorderLevel}</div> */}
    //     </div>
    //     <div className="flex gap-2">
    //       {item.values.map((value) => (
    //         <Badge variant="outline" key={value.variantTypeId}>
    //           {value.value}
    //         </Badge>
    //       ))}
    //     </div>
    //   </div>
    // </div>
  );
}
