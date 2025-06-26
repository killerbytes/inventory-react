import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import validations from "@/schemas";

import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

import {
  categoryServices,
  productServices,
  type Category,
  type Product,
} from "@/services";
import { GlobalContext } from "@/components/GlobalContext";
import { DialogFooter } from "@/components/ui/dialog";
import React, { useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/Modal";

export default function EditModal({
  isOpen,
  onClose,
  cb,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  cb: () => void;
  data: Product;
}) {
  const { store, fetchData } = useContext(GlobalContext || null) || {};
  const [categories, setCategories] = React.useState<Category[]>([]);
  const { productSchema } = validations;
  const schema = productSchema;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...data,
      // reorderLevel: data.reorderLevel.toString(),
      categoryId: Number(data.categoryId),
    },
  });

  interface ApiError {
    field?: string;
    message: string;
  }

  async function onSubmit(values: z.infer<typeof schema>) {
    try {
      const { name, description, categoryId, reorderLevel } = values;
      await productServices.update(data.id, {
        name,
        description,
        categoryId,
        reorderLevel,
      });
      toast.success(`Submitted: ${values.name}`);
      form.reset();
      onClose();
    } catch (error) {
      const { errors } = (
        error as { response: { data: { errors: ApiError[] } } }
      ).response.data;
      errors.forEach((err: ApiError) => {
        if (err.field) {
          form.setError(err.field as keyof z.infer<typeof schema>, {
            type: "server",
            message: err.message,
          });
        }
      });
      toast.error("Submission failed");
    } finally {
      cb();
    }
  }

  useEffect(() => {
    if (fetchData) {
      fetchData("categories", async () => {
        const { data } = await categoryServices.list();
        return data;
      });
    }
  }, [fetchData]);

  useEffect(() => {
    if (store?.categories) {
      setCategories(store.categories as Category[]);
    }
  }, [store?.categories]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        title="Edit Product"
        description="Update existing product details"
      >
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log(form.getValues());
              console.log(form.formState.errors);
              form
                .handleSubmit(onSubmit)(e)
                .catch((error) => {
                  console.error("Form submission error:", error);
                });
            }}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Description"
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
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => {
                      console.log(field);
                      field.onChange(parseInt(value));
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reorderLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reorder Level</FormLabel>
                  <FormControl>
                    <Input placeholder="Reorder Level" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </Modal>
    </>
  );
}
