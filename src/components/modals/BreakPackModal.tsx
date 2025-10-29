import {
  AlertCircleIcon,
  Equal,
  Loader2Icon,
  MoveRight,
  PackageOpen,
  X,
} from "lucide-react";
import {
  ApiErrorResponse,
  BreakPack,
  ProductCombinations,
  VariantTypes,
} from "@/types";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { productCombinationServices, productServices } from "@/services";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useController, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UNIT_COLOR } from "@/utils/definitions";
import { DialogFooter } from "../ui/dialog";
import { breakPackSchema } from "@/schemas";
import { SelectItem } from "../ui/select";
import NumberInput from "../NumberInput";
import ColorBadge from "../ColorBadge";
import { Button } from "../ui/button";
import Select from "../Select";
import { toast } from "sonner";
import Modal from "../Modal";
import React from "react";

export default function BreakPackModal({
  combination,
  isOpen,
  onClose,
  onSubmit,
}: Readonly<{
  combination: ProductCombinations;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}>) {
  const [options, setOptions] = React.useState<ProductCombinations[]>([]);
  const [selected, setSelected] = React.useState<ProductCombinations>();
  const [loading, setLoading] = React.useState(false);
  const form = useForm<BreakPack>({
    resolver: zodResolver(breakPackSchema),
    defaultValues: {
      fromCombinationId: combination.id,
      quantity: 1,
    },
  });

  const quantity = useController({ control: form.control, name: "quantity" });

  const isBreakPack = combination.conversionFactor > selected?.conversionFactor;
  const totalQuantity =
    Number(quantity.field.value) / isBreakPack
      ? Number(combination.conversionFactor)
      : Number(selected?.conversionFactor);

  const filterOptionsByVariant = (
    options: ProductCombinations[],
    variant: string,
  ) => {
    return options.filter((o: ProductCombinations) =>
      o.values.some((v) => v.value === variant),
    );
  };

  const getData = React.useCallback(async () => {
    try {
      const { combinations, variants } = await productServices.get(
        combination?.productId,
      );
      const options = combinations.filter(
        (c: ProductCombinations) => c.id != combination.id,
      );
      const result = variants.find((item: VariantTypes) =>
        /^\[.*\]$/.test(item.name),
      );
      if (result?.id) {
        const variant = combination.values.find(
          (i) => i.variantTypeId === result.id,
        )?.value;
        if (variant) {
          setOptions(filterOptionsByVariant(options, variant));
        } else {
          setOptions(options);
        }
      } else {
        setOptions(options);
      }
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      toast.error("Error fetching products: " + apiError.message);
    }
  }, [combination]);

  React.useEffect(() => {
    if (combination) {
      getData();
    }
  }, [combination, getData]);

  const handleBreakPack = async (values: BreakPack) => {
    try {
      setLoading(true);
      await productCombinationServices.breakPack(values);
      onSubmit();
      toast.success("Break Pack successful");
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError) toast.error("Break Pack failed: " + apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (value: string) => {
    const selected = options.find((o) => o.id === Number(value));
    setSelected(selected);
    form.setValue("toCombinationId", Number(value));
    form.setValue("quantity", Number(selected?.conversionFactor));
  };

  const renderSelectOption = (option: ProductCombinations) => (
    <SelectItem key={option.id} value={String(option.id)}>
      <ColorBadge colorMap={UNIT_COLOR}>{String(option.unit)}</ColorBadge>
      {option.name}
    </SelectItem>
  );

  const renderQuantityField = ({
    field,
  }: {
    field: {
      value: string | number;
      onChange: (value: string | number) => void;
      onBlur: () => void;
      name: string;
      ref: React.Ref<HTMLInputElement>;
    };
  }) => (
    <FormItem className="mb-4">
      <FormLabel>Quantity</FormLabel>
      <NumberInput
        {...field}
        type="number"
        value={Number.parseFloat(String(field.value))}
      />
      <FormMessage />
    </FormItem>
  );

  const handleFormSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log(form.getValues(), form.formState.errors);
    form
      .handleSubmit(handleBreakPack)(e)
      .catch((error) => {
        console.error("Form submission error:", error);
      });
  };
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      title="Break Pack"
      description="Break Pack to another unit"
    >
      <div className="flex flex-col gap-2  ">
        <div className="flex gap-2">
          {combination?.unit && (
            <ColorBadge colorMap={UNIT_COLOR}>{combination.unit}</ColorBadge>
          )}
          {combination?.name}
          <span className="ml-auto">
            Stock: {Number(combination?.inventory?.quantity)}
          </span>
        </div>
      </div>

      <Form {...form}>
        <form className="flex flex-col gap-4">
          {options.length ? (
            <Select
              value={String(selected?.id)}
              options={options}
              onChange={handleSelectChange}
              renderOption={renderSelectOption}
            />
          ) : (
            <Alert variant="destructive">
              <AlertCircleIcon />

              <AlertTitle>
                No other units found with the same variation.
              </AlertTitle>
              <AlertDescription>
                Please add a new combination to the product
              </AlertDescription>
            </Alert>
          )}

          <div>
            <div className="flex gap-2 justify-between items-center">
              {selected && (
                <>
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={renderQuantityField}
                  />
                  <div className="flex gap-2 items-center">
                    {quantity.field.value}
                    <ColorBadge colorMap={UNIT_COLOR}>
                      {String(combination.unit)}
                    </ColorBadge>
                    <MoveRight size={18} />
                    {totalQuantity}
                    <ColorBadge colorMap={UNIT_COLOR}>
                      {String(selected.unit)}
                    </ColorBadge>
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              disabled={!selected || loading}
              onClick={handleFormSubmit}
            >
              {loading ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <PackageOpen />
              )}
              {isBreakPack ? "Break Pack" : "Re-Pack"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
}
