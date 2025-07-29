import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  MODE_OF_PAYMENT,
  MODE_OF_PAYMENT_OPTIONS,
  UNIT_OPTIONS,
} from "@/utils/definitions";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  inventoryServices,
  PurchaseOrder,
  PurchaseOrderItem,
} from "@/services";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { createColumnHelper } from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { purchaseOrderSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import Select from "@/components/Select";
import React, { useMemo } from "react";

export default function Test() {
  React.useEffect(() => {
    const getData = async () => {
      const response = await inventoryServices.list();
      console.log(response);
    };
    getData();
  }, []);

  const form = useForm<PurchaseOrder>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      purchaseOrderNumber: "123123123",
      supplierId: 1,
      modeOfPayment: MODE_OF_PAYMENT_OPTIONS[0].value,
      orderDate: new Date().toISOString(),
      deliveryDate: new Date().toISOString(),

      purchaseOrderItems: [
        { productId: 1, unit: "BOX", unitPrice: 1, quantity: 20 },
      ],
    },
  });
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "purchaseOrderItems",
  });

  const onSubmit = (values: PurchaseOrder) => {
    console.log(values);
  };

  const columnHelper = createColumnHelper<PurchaseOrderItem>();

  const columns = useMemo(
    () => [
      columnHelper.accessor((_, idx) => idx, {
        id: "index",
        header: "#",
        cell: (info) => info.row.index + 1,
      }),
      columnHelper.accessor("unitPrice", {
        header: "Unit Price",
        cell: ({ row }) => (
          <input
            {...register(`purchaseOrderItems.${row.index}.unitPrice`, {
              valueAsNumber: true,
            })}
            className="border px-2"
          />
        ),
      }),
      columnHelper.accessor("unit", {
        header: "Unit",
        cell: ({ row }) => {
          const index = row.index;

          return (
            <Controller
              name={`purchaseOrderItems.${row.index}.unit`}
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  options={UNIT_OPTIONS}
                />
              )}
            />
          );
        },
        xxxcell: ({ row }) => (
          <Select
            {...register(`purchaseOrderItems.${row.index}.unit`)}
            value={row.getValue("unit")}
          >
            {/* <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BOX">Box</SelectItem>
              <SelectItem value="BAG">Bag</SelectItem>
              <SelectItem value="GAL">Gal</SelectItem>
            </SelectContent> */}
          </Select>

          // <select
          //   {...register(`purchaseOrderItems.${row.index}.unit`)}
          //   onChange={(e) => console.log(e.target.name)}
          //   className="border px-2"
          // >
          //   <option value="BOX">Box</option>
          //   <option value="BAG">Bag</option>
          //   <option value="GAL">Gal</option>
          //   <option value="PACK">Pack</option>
          //   <option value="SET">Set</option>
          //   <option value="PCS">Pcs</option>
          // </select>
        ),
      }),
      columnHelper.accessor("quantity", {
        header: "Quantity",
        cell: ({ row }) => (
          <input
            // type="number"
            {...register(`purchaseOrderItems.${row.index}.quantity`, {
              valueAsNumber: true,
            })}
            className="border px-2 w-16"
          />
        ),
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => remove(row.index)}
            className="text-red-500"
          >
            Delete
          </button>
        ),
      }),
    ],
    [register, remove],
  );

  const data = useWatch({
    control,
    name: "purchaseOrderItems",
  });

  const table = useReactTable({
    data: fields,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        console.log(form.formState.errors);
        handleSubmit(onSubmit)(form);
      }}
    >
      <table className="table-auto border">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th key={header.id} className="border px-2 py-1">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border px-2 py-1">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <button
        type="button"
        onClick={() =>
          append({ productId: 1, unit: "BOX", unitPrice: 1, quantity: 10 })
        }
        className="mt-2 bg-blue-500 text-white px-4 py-1"
      >
        Add Row
      </button>

      <button type="submit" className="ml-2 bg-green-500 text-white px-4 py-1">
        Submit
      </button>
      {JSON.stringify(data)}
    </form>
  );
}
