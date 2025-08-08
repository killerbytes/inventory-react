import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PlusIcon, Save, Search, Trash2, X } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { ColumnDef } from "@tanstack/react-table";
import ConfirmDialog from "../ConfirmDialog";
import { DialogFooter } from "../ui/dialog";
import useToggle from "@/hooks/useToggle";
import { DataTable } from "../DataTable";
import { VariantTypes } from "@/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Modal from "../Modal";
import Badge from "../Badge";
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
  onOpenVariantTemplatePicker: () => void;
}) {
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
        accessorKey: "value",
        header: "",
        cell: ({ row }) => (
          <FormField
            control={form.control}
            name={`values.${row.index}.value`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} placeholder="Value e.g. Red" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        ),
      },
      {
        accessorKey: "id",
        header: "#",
        meta: {
          className: "w-0",
        },
        cell: ({ row }) => (
          <Button
            onClick={() => remove(row.index)}
            variant="ghost"
            className="text-red-500"
            size="sm"
          >
            <X />
          </Button>
        ),
      },
    ],
    [form.control, remove],
  );
  return (
    <>
      <Form {...form}>
        <form>
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Name</FormLabel>

                <FormControl>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 w-full">
                      {onOpenVariantTemplatePicker && (
                        <Button
                          variant="secondary"
                          type="button"
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
                          <Button variant="secondary" className="text-red-500">
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
              <FormItem className="mb-2">
                <FormLabel>Values</FormLabel>
                <FormControl>
                  <DataTable
                    data={fields}
                    columns={columns}
                    emptyText="Add values..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex mb-8 gap-2 justify-between">
            {selected?.id && (
              <Button
                variant="secondary"
                onClick={() =>
                  handleToggle({
                    saveTemplateModal: true,
                  })
                }
                type="button"
              >
                <Save />
              </Button>
            )}
            <Button
              variant="outline"
              className="shadow-sm"
              onClick={() => append({ value: "", variantTypeId: undefined })}
              type="button"
            >
              <PlusIcon />
            </Button>
          </div>

          <DialogFooter>
            <Button
              type="button"
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
      {toggle.saveTemplateModal && (
        <Modal
          isOpen={toggle.saveTemplateModal}
          onOpenChange={() => handleToggle({ saveTemplateModal: false })}
          title="Save to Variant Template"
          description="Save as new Variant Template"
          size="sm"
        >
          <div className="flex items-center gap-2">
            {selected?.values.map((i) => <Badge>{i.value}</Badge>)}
          </div>
          <Input placeholder="New Template Name" />
          <DialogFooter>
            <Button
              type="button"
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
              Save
            </Button>
          </DialogFooter>
        </Modal>
      )}
    </>
  );
}
