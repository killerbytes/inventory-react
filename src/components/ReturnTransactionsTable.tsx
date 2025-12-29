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
        header: "Unit",
        accessorKey: "unit",
        cell: ({ row }) => {
          return (
            <ColorBadge colorMap={UNIT_COLOR}>
              {String(row.original.combination?.unit)}
            </ColorBadge>
          );
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
      <Label className="font-bold">Return Transactions</Label>

      <Accordion type="multiple" className="w-full">
        {data?.map((item) => {
          const returns = item.returnItems.filter((i) => i.type === "RETURN");
          const exchanges = item.returnItems.filter(
            (i) => i.type === "EXCHANGE",
          );
          return (
            <AccordionItem value={String(item.id)} key={item.id}>
              <AccordionTrigger className="flex justify-between font-bold">
                {formatDate(item.updatedAt)}
                <div className="flex gap-4 ml-auto font-normal">
                  <span>Returns:</span>
                  <Label className="font-semibold text-red-500">
                    {formatCurrency(item.totalReturnAmount)}
                  </Label>
                  {item.totalExchangeAmount > 0 && (
                    <>
                      <span>Exchanges:</span>
                      <Label className="font-semibold ">
                        {formatCurrency(item.totalExchangeAmount)}
                      </Label>
                    </>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4">
                {returns.length > 0 && (
                  <>
                    <Label className="font-bold">Returns</Label>
                    <DataTable
                      data={returns}
                      columns={columns}
                      showFooter
                      renderFooter={(data) => {
                        const total = data.reduce(
                          (acc, item) => (acc += Number(item.totalAmount)),
                          0,
                        );
                        return (
                          <TableRow>
                            <TableCell>Total</TableCell>
                            <TableCell
                              colSpan={10}
                              className="text-right font-bold text-red-500"
                            >
                              -{formatCurrency(total)}
                            </TableCell>
                          </TableRow>
                        );
                      }}
                    />
                  </>
                )}
                {exchanges.length > 0 && (
                  <>
                    <Label className="font-bold">Exchange</Label>
                    <DataTable
                      data={exchanges}
                      columns={columns}
                      showFooter
                      renderFooter={(data) => {
                        const total = data.reduce(
                          (acc, item) => (acc += Number(item.totalAmount)),
                          0,
                        );
                        return (
                          <TableRow>
                            <TableCell>Total</TableCell>
                            <TableCell
                              colSpan={10}
                              className="text-right font-bold"
                            >
                              {formatCurrency(total)}
                            </TableCell>
                          </TableRow>
                        );
                      }}
                    />
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </>
  );
}
