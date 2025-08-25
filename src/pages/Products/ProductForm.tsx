import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BASE_UNIT_OPTIONS, UNIT_COLOR } from "@/utils/definitions";
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
        name="baseUnit"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel>Base Unit</FormLabel>
            <FormControl>
              <Select
                {...field}
                options={BASE_UNIT_OPTIONS}
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
    </>
  );
}
