import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UNIT_OPTIONS } from "@/utils/definitions";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Category, Product } from "@/types";
import Select from "@/components/Select";

export default function ProductForm({
  form,
  categories,
}: {
  form: UseFormReturn<Product>;
  onSubmit: (e: Product) => Promise<void>;
  categories: Category[];
}) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>Name</FormLabel>
            <Input {...field} />
            <FormMessage />
            <FormField
              control={form.control}
              name="products_name_unit"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>Category</FormLabel>
            <Select
              {...field}
              options={categories}
              labelKey="name"
              valueKey="id"
              onChange={(e) => {
                field.onChange(Number(e.target.value));
              }}
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="unit"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>Unit</FormLabel>
            <Select {...field} options={UNIT_OPTIONS} />
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
