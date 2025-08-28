import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { ColumnDef } from "@tanstack/react-table";
import { TableCell, TableRow } from "../ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { Plus, Trash2, X } from "lucide-react";
import ConfirmDialog from "../ConfirmDialog";
import { DialogFooter } from "../ui/dialog";
import { DataTable } from "../DataTable";
import { VariantTypes } from "@/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import React from "react";

export default function VariantTypesForm({
  form,
  onSubmit,
  selected,
  onDelete,
  variantTypes,
}: {
  form: UseFormReturn<VariantTypes>;
  onSubmit: (e: VariantTypes) => Promise<void>;
  selected?: VariantTypes;
  onDelete: () => Promise<void>;
  variantTypes: VariantTypes[];
}) {
  const [values, setValues] = React.useState("");
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "values",
    keyName: "id",
  });

  const columns = React.useMemo<ColumnDef<VariantTypes>[]>(
    () => [
      {
        accessorKey: "id",
        meta: {
          className: "w-[50px]",
        },
        cell: ({ row }) => (
          <Button
            onClick={() => remove(row.index)}
            variant="ghost"
            className="text-red-500"
            size="sm"
            type="button"
            tabIndex={-1}
          >
            <X />
          </Button>
        ),
      },
      {
        accessorKey: "value",
        meta: {
          className: "w-full",
        },
        cell: ({ row }) => (
          <FormField
            control={form.control}
            name={`values.${row.index}.value`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Value e.g. Red"
                    className="w-full"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        ),
      },
    ],
    [form.control, remove],
  );
  return (
    <>
      <Form {...form}>
        <form className="flex flex-col gap-4">
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>

                <FormControl>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 w-full">
                      <Input
                        placeholder="Variant Type, e.g. Color"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </div>

                    {selected && variantTypes.includes(selected) && (
                      <>
                        <ConfirmDialog
                          title={`Delete Variant`}
                          onConfirm={async (e) => {
                            e.preventDefault();
                            await onDelete();
                          }}
                        >
                          <Button
                            variant="outline"
                            className="text-red-500 shadow-sm"
                            tabIndex={-1}
                          >
                            <Trash2 />
                          </Button>
                        </ConfirmDialog>
                      </>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="values"
            render={() => (
              <FormItem>
                <FormLabel>Values</FormLabel>
                <FormControl>
                  <ScrollArea
                    className="h-[280px]  rounded-md border"
                    tabIndex={-1}
                    autoFocus={false}
                  >
                    <DataTable
                      data={fields}
                      columns={columns}
                      emptyText="Add values..."
                      showHeader={false}
                      showFooter={false}
                      xrenderFooter={() => (
                        <TableRow>
                          <TableCell>
                            <Button
                              type="button"
                              variant="outline"
                              className="shadow-sm"
                              onClick={() =>
                                append({ value: "", variantTypeId: undefined })
                              }
                            >
                              <Plus />
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={values}
                              onChange={(e) => setValues(e.target.value)}
                              onKeyDown={(
                                e: React.KeyboardEvent<HTMLInputElement>,
                              ) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const inputTarget =
                                    e.target as HTMLInputElement;
                                  const values = inputTarget.value.split(",");
                                  values.forEach((value) => {
                                    append({
                                      value: value.trim(),
                                      variantTypeId: undefined,
                                    });
                                  });
                                  setValues("");
                                }
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    />
                  </ScrollArea>
                </FormControl>
                <div className="flex gap-2 justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="shadow-sm"
                    onClick={() =>
                      append({ value: "", variantTypeId: undefined })
                    }
                  >
                    <Plus />
                  </Button>
                  <Input
                    placeholder="Add values separated by comma"
                    value={values}
                    onChange={(e) => setValues(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const inputTarget = e.target as HTMLInputElement;
                        const values = inputTarget.value.split(",");
                        values.forEach((value) => {
                          append({
                            value: value.trim(),
                            variantTypeId: undefined,
                          });
                        });
                        setValues("");
                      }
                    }}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="submit"
              className="shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                console.log(form.getValues(), form.formState.errors);
                form
                  .handleSubmit(onSubmit)(e)
                  .catch((error) => {
                    console.error("Form submission error:", error);
                  });
              }}
            >
              {selected?.id ? "Update Variant" : "Add Variant"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
