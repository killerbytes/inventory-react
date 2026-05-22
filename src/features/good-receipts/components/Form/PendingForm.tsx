import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Controller,
  useFieldArray,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { goodReceiptItemDefault, UNIT_COLOR } from "@/utils/definitions";
import ProductLookupInput from "@/components/forms/ProductLookupInput";
import LineColumn from "@/components/forms/OrderItemForm/LineColumn";
import { GoodReceiptForm, GoodReceiptItem } from "@/schemas";
import { TableCell, TableRow } from "@/components/ui/table";
import { getTotalAmountTableFooter } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import Autocomplete from "@/components/Autcomplete";
import { formatCurrency } from "@/utils/formatters";
import NumberInput from "@/components/NumberInput";
import { DataTable } from "@/components/DataTable";
import { useSuppliers } from "@/hooks/useSupplier";
import { ColumnDef } from "@tanstack/react-table";
import DatePicker from "@/components/DatePicker";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import React from "react";

export default function PendingForm({
  form,
}: {
  form: UseFormReturn<GoodReceiptForm>;
}) {
  const { data: suppliers } = useSuppliers();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "goodReceiptLines",
    keyName: "fieldId",
  });

  const watchGoodReceiptLines = useWatch({
    control: form?.control,
    name: "goodReceiptLines",
  }) as GoodReceiptItem[];

  const footerValues = useWatch({
    control: form?.control,
    name: "goodReceiptLines",
  });

  const columns = React.useMemo<ColumnDef<GoodReceiptItem>[]>(
    () => [
      {
        accessorKey: "index",
        header: "",
        meta: {
          className: "w-0",
        },
        cell: ({ row }) => (
          <Button
            onClick={() => remove(row.index)}
            variant="outline"
            type="button"
            tabIndex={-1}
          >
            <Trash2 />
          </Button>
        ),
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        meta: {
          headerClassName: "text-right",
          className: "text-right w-20",
        },
        cell: ({ row }) => (
          <FormField
            control={form.control}
            name={`goodReceiptLines.${row.index}.quantity`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <NumberInput {...field} value={Number(field.value)} />
                </FormControl>
              </FormItem>
            )}
          />
        ),
      },
      {
        accessorKey: "unit",
        header: "Unit",
        meta: {
          className: "w-15",
        },
        cell: ({ row }) => {
          return (
            <LineColumn
              index={row.index}
              control={form.control}
              name="goodReceiptLines"
            >
              {(value) =>
                value.combinations?.unit && (
                  <ColorBadge colorMap={UNIT_COLOR}>
                    {value.combinations.unit}
                  </ColorBadge>
                )
              }
            </LineColumn>
          );
        },
      },
      {
        accessorKey: "combinationId",
        header: "Product",
        cell: ({ row }) => {
          return (
            <FormField
              control={form.control}
              name={`goodReceiptLines.${row.index}.combinationId`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ProductLookupInput
                      index={row.index}
                      ariaInvalid={Boolean(
                        form.formState.errors?.goodReceiptLines?.[row.index]
                          ?.combinationId,
                      )}
                      form={form}
                      {...field}
                      name="goodReceiptLines"
                      noBreakPacks
                      onChange={(value) => {
                        field.onChange(value.id);
                        console.log(value);

                        form.setValue(
                          `goodReceiptLines.${row.index}.combinations`,
                          value,
                        );
                        setTimeout(() => {
                          form.setFocus(
                            `goodReceiptLines.${row.index}.purchasePrice`,
                          );
                        }, 0);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          );
        },
      },
      {
        accessorKey: "discount",
        header: "Discount",
        meta: {
          className: "text-right w-32",
          type: "currency",
        },
        cell: ({ row }) => (
          <Controller
            name={`goodReceiptLines.${row.index}.discount`}
            control={form.control}
            render={({ field }) => (
              <NumberInput {...field} type="currency" tabIndex={-1} />
            )}
          />
        ),
      },
      {
        accessorKey: "discountNote",
        header: "Discount Note",
        meta: {
          className: "w-50",
        },
        cell: ({ row }) => (
          <Controller
            name={`goodReceiptLines.${row.index}.discountNote`}
            control={form.control}
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ? String(field.value) : undefined}
                tabIndex={-1}
              />
            )}
          />
        ),
      },
      {
        accessorKey: "purchasePrice",
        header: "Price",
        meta: {
          className: "text-right min-w-[100px] w-[110px]",
        },
        cell: ({ row }) => (
          <FormField
            control={form.control}
            name={`goodReceiptLines.${row.index}.purchasePrice`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <NumberInput {...field} type="currency" />
                </FormControl>
              </FormItem>
            )}
          />
        ),
      },
      {
        accessorKey: "totalAmount",
        header: () => <div className="text-right">Amount</div>,
        meta: {
          className: "text-right w-20",
        },
        cell: ({ row }) => (
          <LineColumn
            index={row.index}
            control={form.control}
            name="goodReceiptLines"
          >
            {(value) => {
              const q = Number(value.quantity);
              const p =
                Number(value.purchasePrice) - Number(value.discount) / q;
              const total = q * p || 0;
              return formatCurrency(total);
            }}
          </LineColumn>
        ),
      },
    ],
    [form, remove],
  );

  const tableData = fields.map((field, index) => ({
    ...field,
    ...watchGoodReceiptLines?.[index],
  }));

  return (
    <Form {...form}>
      <form className="flex gap-4 items-start flex-col">
        <FormField
          control={form.control}
          name="supplierId"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Supplier</FormLabel>
              <Autocomplete
                value={
                  suppliers?.find((supplier) => supplier.id === field.value)
                    ?.name
                }
                options={suppliers || []}
                placeholder="Supplier"
                onChange={(value) => {
                  form.setValue("supplierId", Number(value.id), {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              />

              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-full flex flex-col gap-4 items-start md:flex-row">
          <FormField
            control={form.control}
            name="receiptDate"
            render={({ field }) => (
              <FormItem className="w-full md:w-1/4">
                <FormLabel>Receipt Date</FormLabel>
                <DatePicker {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="referenceNo"
            render={({ field }) => (
              <FormItem className="w-full md:w-1/4">
                <FormLabel>DDR / Reference No</FormLabel>
                <FormControl>
                  <Input
                    placeholder="DDR / Reference No"
                    className="resize-none"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="internalNotes"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Internal Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter some internal notes..."
                  className="resize-none"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="goodReceiptLines"
          render={() => (
            <FormItem className="w-full">
              <FormControl>
                <DataTable
                  data={tableData}
                  columns={columns}
                  renderFooter={() => {
                    const total = getTotalAmountTableFooter(footerValues);
                    return (
                      <>
                        <TableRow>
                          <TableCell colSpan={8}>
                            <Button
                              type="button"
                              variant="outline"
                              className="shadow-sm append-btn"
                              onClick={() => append(goodReceiptItemDefault)}
                            >
                              <Plus />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow className="font-bold">
                          <TableCell>Total</TableCell>
                          <TableCell colSpan={10} className="text-right">
                            {formatCurrency(total?.amount - total?.discount)}
                          </TableCell>
                        </TableRow>
                      </>
                    );
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
