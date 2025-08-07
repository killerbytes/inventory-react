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
  onSubmit,
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
      {/* <FormField
          control={form.control}
          name="variants"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <VariantInput
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);

                    form
                      .handleSubmit(onSubmit)()
                      .catch((error) => {
                        console.error("Form submission error:", error);
                      });
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}
      {/* <div className="flex mb-4">
          <Button
            onClick={() => handleToggle({ variantModal: true })}
            type="button"
          >
            Variant Manager
          </Button>
        </div>

        <FormField
          control={form.control}
          name="combinations"
          render={() => (
            <FormItem className="mb-2">
              <FormLabel>Product Variants</FormLabel>
              <FormControl>
                <DataTable data={fields} columns={columns} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end mb-8">
          <Button
            type="button"
            onClick={() => {
              append({
                productId: 1,
                sku: "XXX",
                price: Number("123.00"),
                deletedAt: null,
                values: variants.map((i) => ({
                  variantTypeId: i.id,
                  value: i.values[0].value,
                })),
              } as Combinations);
            }}
          >
            <Plus /> Add Variant
          </Button>
        </div> */}
    </>
  );
}
