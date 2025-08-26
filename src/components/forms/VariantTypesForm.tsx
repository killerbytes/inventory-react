import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import VariantCopyTemplateForm from "./VariantCopyTemplateForm";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Plus, Save, Search, Trash2, X } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { TableCell, TableRow } from "../ui/table";
import ConfirmDialog from "../ConfirmDialog";
import { DialogFooter } from "../ui/dialog";
import useToggle from "@/hooks/useToggle";
import { DataTable } from "../DataTable";
import { VariantTypes } from "@/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Modal from "../Modal";
import React from "react";

export default function VariantTypesForm({
  form,
  onSubmit,
  selected,
  onDelete,
  onOpenVariantTemplatePicker,
}: {
  form: UseFormReturn<VariantTypes>;
  onSubmit: (e: VariantTypes) => Promise<void>;
  selected?: VariantTypes;
  onDelete: () => Promise<void>;
  onOpenVariantTemplatePicker?: () => void;
}) {
  const [values, setValues] = React.useState();
  const { toggle, handleToggle } = useToggle({
    saveTemplateModal: false,
  });
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
                    <div className="flex items-center gap-1 w-full">
                      {onOpenVariantTemplatePicker && (
                        <Button
                          variant="outline"
                          type="button"
                          className="shadow-sm"
                          onClick={() => {
                            onOpenVariantTemplatePicker();
                          }}
                        >
                          <Search />
                        </Button>
                      )}

                      <Input
                        placeholder="Variant Type, e.g. Color"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </div>

                    {selected && (
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
                  <DataTable
                    data={fields}
                    columns={columns}
                    emptyText="Add values..."
                    showHeader={false}
                    showFooter={true}
                    renderFooter={() => (
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex  gap-2 justify-between">
            {selected?.id && (
              <Button
                variant="outline"
                className="shadow-sm"
                onClick={() => {
                  handleToggle({
                    saveTemplateModal: true,
                  });
                }}
                type="button"
              >
                <Save />
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
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
      {toggle.saveTemplateModal && selected && (
        <Modal
          isOpen={toggle.saveTemplateModal}
          onOpenChange={() => handleToggle({ saveTemplateModal: false })}
          title="Save to Variant Template"
          description="Save as new Variant Template"
          size="sm"
        >
          <VariantCopyTemplateForm selected={selected} />
        </Modal>
      )}
    </>
  );
}
