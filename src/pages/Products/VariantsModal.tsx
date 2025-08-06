import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "@/components/ui/dialog";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { variantTypesServices } from "@/services";
import { Button } from "@/components/ui/button";
import { PlusIcon, Trash2 } from "lucide-react";
import { variantTypesSchema } from "@/schemas";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Modal from "@/components/Modal";
import { VariantTypes } from "@/types";
import React, { useMemo } from "react";
import { z } from "zod";

const defaultValues: VariantTypes = {
  name: "",
  values: [],
};
export default function VariantsModal({
  productId,
  isOpen,
  onClose,
}: {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selected, setSelected] = React.useState<VariantTypes>();
  const [variantTypes, setVariantTypes] = React.useState<VariantTypes[]>([]);
  const form = useForm<VariantTypes>({
    defaultValues,
    resolver: zodResolver(variantTypesSchema),
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "values",
    keyName: "id",
  });

  const handleSubmit = async (form: z.infer<typeof variantTypesSchema>) => {
    const payload = {
      ...form,
      productId: Number(productId),
    };
    if (form.id) {
      await variantTypesServices.update(String(form.id), payload);
    } else {
      await variantTypesServices.create(payload);
    }
    getData();
  };

  React.useEffect(() => {
    form.reset(selected);
  }, [form, selected]);

  const getData = React.useCallback(async () => {
    if (!productId) return;
    const data = await variantTypesServices.get(String(productId));
    setVariantTypes(data);
    form.reset(defaultValues);
  }, [productId]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  const handleDelete = async () => {
    await variantTypesServices.delete(String(selected?.id));
    form.reset(defaultValues);
    getData();
  };

  const columns = useMemo<ColumnDef<VariantTypes>[]>(
    () => [
      {
        accessorKey: "id",
        header: "#",
        meta: {
          className: "w-0",
        },
        cell: ({ row }) => (
          <Button onClick={() => remove(row.index)} variant="ghost">
            <Trash2 />
          </Button>
        ),
      },
      {
        accessorKey: "value",
        header: "",
        cell: ({ row }) => (
          // <Controller
          //   name={`values.${row.index}.value`}
          //   control={form.control}
          //   render={({ field }) => <Input {...field} />}
          // />
          <FormField
            control={form.control}
            name={`values.${row.index}.value`}
            render={({ field }) => (
              <FormItem className="mb-2">
                <FormControl>
                  <Input {...field} placeholder="Value e.g. Red" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        ),
      },
    ],
    [remove],
  );
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Variants"
      description="Add variants to the product"
    >
      <div className="flex flex-wrap gap-2 items-center">
        {variantTypes.map((v, index) => (
          <Badge
            // variant="secondary"
            className={cx("text-md cursor-pointer ", {
              "bg-orange-500 text-white": selected?.id === v.id,
            })}
            key={index}
            onClick={() => {
              setSelected(v);
            }}
          >
            {v.name}
          </Badge>
        ))}
        <Button
          variant="outline"
          type="button"
          className={cx({ "bg-orange-500 text-white": !selected })}
          size={"sm"}
          onClick={() => {
            form.reset(defaultValues);
            setSelected(undefined);
          }}
        >
          <PlusIcon />
        </Button>
      </div>

      <Form {...form}>
        <form>
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Variant Type, e.g. Color"
                      {...field}
                      value={field.value ?? ""}
                    />
                    {selected && (
                      <Button onClick={handleDelete} type="button">
                        <Trash2 />
                      </Button>
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
                  <DataTable data={fields} columns={columns} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end mb-8">
            <Button
              onClick={() => append({ value: "", variantTypeId: undefined })}
              variant="outline"
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
                console.log(form.formState.errors);
                form
                  .handleSubmit(handleSubmit)(e)
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
    </Modal>
  );
}
