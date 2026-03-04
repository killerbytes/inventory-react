import { ProductCombinationsForm, VariantTypes } from "@/schemas";
import { Controller, UseFormReturn } from "react-hook-form";
import { SelectItem } from "@/components/ui/select";
import { cx } from "class-variance-authority";
import Select from "@/components/Select";
import React from "react";

export default function VariantCell({
  form,
  index,
  idx,
  variant,
}: {
  form: UseFormReturn<{ combinations: ProductCombinationsForm[] }>;
  index: number;
  idx: number;
  variant: VariantTypes;
}) {
  // Focus when this cell is the first one (row 0, variant 0)
  React.useEffect(() => {
    if (index === 0 && idx === 0) {
      form.setFocus(`combinations.${index}.values.${idx}`);
    }
  }, [form, index, idx]);

  return (
    <Controller
      name={`combinations.${index}.values.${idx}`}
      control={form.control}
      render={({ field }) => {
        const error =
          form.formState.errors?.combinations?.[index]?.values?.[idx]?.value;

        return (
          <Select
            {...field}
            className={cx("w-full", error && "border-red-500")}
            value={String(
              variant.values.find((i) => i.id === field.value?.id)?.id ?? "",
            )}
            options={variant.values as { id: number; value: string }[]}
            onChange={(value) => {
              field.onChange(
                variant.values.find((v) => v.id === Number(value)),
              );
            }}
            renderOption={(option: { id: number; value: string }) => (
              <SelectItem key={option.id} value={String(option.id)}>
                {option.value}
              </SelectItem>
            )}
          />
        );
      }}
    />
  );
}
