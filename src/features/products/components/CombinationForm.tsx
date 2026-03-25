import { PackageOpen, Save, Trash2 } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UNIT_COLOR, UNIT_OPTIONS } from "@/utils/definitions";
import { Product, ProductCombinationInput } from "@/schemas";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectItem } from "@/components/ui/select";
import NumberInput from "@/components/NumberInput";
import ColorBadge from "@/components/ColorBadge";
import { cx } from "class-variance-authority";
import Select from "@/components/Select";

export default function CombinationForm({
  product,
  form,
  handleSubmit,
  handleRemove,
  handleAdd,
}: {
  product: Product;
  form: ReturnType<typeof useForm<ProductCombinationInput>>;
  handleSubmit: (values: ProductCombinationInput) => Promise<void>;
  handleRemove?: () => void;
  handleAdd?: () => void;
}) {
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log(form.getValues(), form.formState.errors);
            form
              .handleSubmit(handleSubmit)(e)
              .catch((error) => {
                console.error("Form submission error:", error);
              });
          }}
          className="flex flex-col gap-4"
        >
          <>
            <FormField
              control={form.control}
              name={`sku`}
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-2">
              {(product.variants || []).map((variant, idx) => (
                <FormField
                  control={form.control}
                  key={variant.id}
                  name={`values.${idx}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{variant.name}</FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          className={cx("w-full")}
                          disabled={field.value?.disabled}
                          value={String(
                            variant.values.find((i) => i.id === field.value?.id)
                              ?.id ?? "",
                          )}
                          options={
                            variant.values as { id: number; value: string }[]
                          }
                          onChange={(value) => {
                            field.onChange(
                              variant.values.find(
                                (v) => v.id === Number(value),
                              ),
                            );
                          }}
                          renderOption={(option: {
                            id: number;
                            value: string;
                          }) => (
                            <SelectItem
                              key={option.id}
                              value={String(option.id)}
                            >
                              {option.value}
                            </SelectItem>
                          )}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        value={String(field.value)}
                        options={UNIT_OPTIONS}
                        renderOption={(unit) => (
                          <SelectItem
                            key={unit.value}
                            value={String(unit.value)}
                          >
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
                name={`price`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <NumberInput {...field} type="currency" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`conversionFactor`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conversion Factor</FormLabel>
                    <FormControl>
                      <NumberInput
                        {...field}
                        decimalScale={2}
                        tabIndex={-1}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`reorderLevel`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Level</FormLabel>
                    <FormControl>
                      <NumberInput {...field} tabIndex={-1} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-2 justify-center">
                <FormField
                  control={form.control}
                  name={`isBreakPack`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center">
                      <FormControl>
                        <Checkbox
                          {...field}
                          tabIndex={-1}
                          checked={field.value || false}
                          onCheckedChange={(value) => {
                            field.onChange(value);
                          }}
                          value={String(field.value)}
                        />
                      </FormControl>
                      <FormLabel>Is Break Pack</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`isActive`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center ">
                      <FormControl>
                        <Checkbox
                          {...field}
                          tabIndex={-1}
                          checked={field.value || false}
                          onCheckedChange={(value) => {
                            field.onChange(value);
                          }}
                          value={String(field.value)}
                        />
                      </FormControl>
                      <FormLabel>Is Active</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </>
          <DialogFooter className="flex items-center text-left flex-row">
            {handleRemove && (
              <Button
                onClick={handleRemove}
                type="button"
                variant="destructive"
                className="mr-auto"
              >
                <Trash2 />
              </Button>
            )}

            {handleAdd && (
              <Button variant="outline" onClick={handleAdd} type="button">
                <PackageOpen />
                New Breakpack
              </Button>
            )}

            <Button className="shadow-sm" type="submit">
              <Save />
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
