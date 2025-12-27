import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { GLOBAL_COLOR, ROUTES, UNIT_COLOR } from "@/utils/definitions";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { ReturnItem, ReturnTransaction } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { TableCell, TableRow } from "./ui/table";
import { cx } from "class-variance-authority";
import { DataTable } from "./DataTable";
import ColorBadge from "./ColorBadge";
import { Link } from "react-router";
import { Label } from "./ui/label";
import React from "react";

export default function ReturnTransactionsTable({
  data,
}: {
  data: ReturnTransaction[];
}) {
  const columns = React.useMemo<ColumnDef<ReturnItem>[]>(
    () => [
      {
        accessorKey: "index",
        header: "#",
        size: 20,
        cell: ({ row }) => {
          return row.index + 1;
        },
      },
      {
        header: "Quantity",
        accessorKey: "quantity",
        size: 20,
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },

        cell: ({ row }) => {
          return Number(row.original.quantity);
        },
      },
      {
        accessorKey: "nameSnapshot",
        header: "Product",
        meta: {
          className: cx("w-1/2", GLOBAL_COLOR.PRODUCT),
        },
        cell: ({ row }) => {
          return (
            <div className="flex gap-1">
              <Link
                to={`${ROUTES.PRODUCTS}/${row.original.combination?.productId}`}
                className={cx("font-medium", GLOBAL_COLOR.PRODUCT)}
              >
                {row.original.combination?.name}
              </Link>
            </div>
          );
        },
      },
      {
        header: "Unit",
        accessorKey: "unit",
        size: 20,
        cell: ({ row }) => {
          return (
            <ColorBadge colorMap={UNIT_COLOR}>
              {String(row.original.combination?.unit)}
            </ColorBadge>
          );
        },
      },

      {
        header: "Price",
        accessorKey: "unitPrice",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },

        cell: ({ row }) => {
          return formatCurrency(Number(row.original.unitPrice));
        },
      },
      {
        header: "Amount",
        accessorKey: "totalAmount",
        meta: {
          headerClassName: "text-right",
          className: "text-right",
        },

        cell: ({ row }) => {
          return formatCurrency(Number(row.original.totalAmount));
        },
      },
    ],
    [],
  );

  return (
    <>
      <Accordion
        type="multiple"
        className="w-full"
        defaultValue={data?.map((i) => String(i.id))}
      >
        {data?.map((item) => (
          <AccordionItem value={String(item.id)} key={item.id}>
            <AccordionTrigger className="flex justify-between">
              {formatDate(item.updatedAt)}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              <Label>Returned Items</Label>
              <DataTable
                data={item.returnItems.filter((i) => i.type === "RETURN")}
                columns={columns}
                showFooter
                renderFooter={(data) => {
                  const total = data.reduce(
                    (acc, item) => (acc += Number(item.totalAmount)),
                    0,
                  );
                  return (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-right font-bold text-red-500"
                      >
                        {formatCurrency(total)}
                      </TableCell>
                    </TableRow>
                  );
                }}
              />
              <Label>Exchanged Items</Label>
              <DataTable
                data={item.returnItems.filter((i) => i.type === "EXCHANGE")}
                columns={columns}
                showFooter
                renderFooter={(data) => {
                  const total = data.reduce(
                    (acc, item) => (acc += Number(item.totalAmount)),
                    0,
                  );
                  return (
                    <TableRow>
                      <TableCell colSpan={10} className="text-right font-bold">
                        {formatCurrency(total)}
                      </TableCell>
                    </TableRow>
                  );
                }}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}
