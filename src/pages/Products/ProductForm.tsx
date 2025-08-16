import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UNIT_COLOR, UNIT_OPTIONS } from "@/utils/definitions";
import { Textarea } from "@/components/ui/textarea";
import { SelectItem } from "@/components/ui/select";
import ColorBadge from "@/components/ColorBadge";
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
            <FormControl>
              <Select
                {...field}
                options={categories}
                onChange={(value) => {
                  field.onChange(value);
                }}
                value={String(field.value)}
                renderOption={({ id, name }) => (
                  <SelectItem key={id} value={String(id)}>
                    {name}
                  </SelectItem>
                )}
              />
            </FormControl>
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
            <FormControl>
              <Select
                {...field}
                options={UNIT_OPTIONS}
                renderOption={(unit) => (
                  <SelectItem key={unit.value} value={String(unit.value)}>
                    <ColorBadge colorMap={UNIT_COLOR}>
                      {String(unit.label)}
                    </ColorBadge>
                  </SelectItem>
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="conversionFactor"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>Conversion Factor</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={Number(field.value)}
                placeholder="eg: How many pieces of this product are in a unit?"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
