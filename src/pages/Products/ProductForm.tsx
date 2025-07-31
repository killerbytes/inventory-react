import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { UNIT_OPTIONS } from "@/utils/definitions";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { categoryServices } from "@/services";
import { useCategoryStore } from "@/stores";
import Select from "@/components/Select";
import { Product } from "@/types";
import React from "react";

export default function ProductForm({
  form,
  onSubmit,
  children,
  state = "ADD",
}: {
  form: UseFormReturn<Product>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children?: React.ReactNode;
  state?: "ADD" | "EDIT";
}) {
  const { categories, setCategories } = useCategoryStore();

  React.useEffect(() => {
    const getData = async () => {
      const data = await categoryServices.list();
      setCategories(data);
    };
    if (categories.length === 0) {
      getData();
    }
  }, []);
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-8">
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
                <Textarea
                  placeholder="Description"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                {...field}
                options={categories}
                labelKey="name"
                valueKey="id"
              ></Select>

              <FormMessage />
            </FormItem>
          )}
        /> */}
        {/* {state === "ADD" && (
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Select {...field} options={UNIT_OPTIONS}></Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )} */}

        <DialogFooter>{children}</DialogFooter>
      </form>
    </Form>
  );
}
