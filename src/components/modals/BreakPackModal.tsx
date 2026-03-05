import {
  ApiErrorResponse,
  breakPackBaseSchema,
  BreakPackInput,
  ProductCombination,
  VariantTypes,
} from "@/schemas";
import {
  AlertCircleIcon,
  Equal,
  Loader2Icon,
  MoveRight,
  PackageOpen,
  PackagePlus,
} from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { productCombinationServices, productServices } from "@/services";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useController, useForm } from "react-hook-form";
import { ERROR, UNIT_COLOR } from "@/utils/definitions";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogFooter } from "../ui/dialog";
import { SelectItem } from "../ui/select";
import NumberInput from "../NumberInput";
import ColorBadge from "../ColorBadge";
import { Button } from "../ui/button";
import { useStore } from "@/stores";
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
  combination: ProductCombination;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}>) {
  const [options, setOptions] = React.useState<ProductCombination[]>([]);
  const [selected, setSelected] = React.useState<ProductCombination>();
  const [loading, setLoading] = React.useState(false);
  const { productCombinationState } = useStore();
  const form = useForm<BreakPackInput>({
    resolver: zodResolver(breakPackBaseSchema),
    defaultValues: {
      fromCombinationId: combination.id,
      quantity: 1,
    },
  });

  const quantity = useController({ control: form.control, name: "quantity" });

  const packType = getPackRelationType(combination, selected);

  let totalQuantity;
  if (packType === "BREAK_PACK") {
    totalQuantity =
      Number(quantity.field.value) * Number(combination.conversionFactor);
  } else if (packType === "RE_PACK") {
    totalQuantity =
      Number(quantity.field.value) / Number(selected?.conversionFactor);
  }

  React.useEffect(() => {
    if (combination?.inventory?.quantity && packType === "RE_PACK") {
      form.reset({
        ...form.getValues(),
        quantity: Number(selected?.conversionFactor),
      });
    }
  }, [combination, form, packType, selected?.conversionFactor]);

  const filterOptionsByVariant = (
    options: ProductCombination[],
    variant: string,
  ) => {
    return options.filter((o: ProductCombination) =>
      o.values.some((v) => v.value === variant),
    );
  };

  const getData = React.useCallback(async () => {
    try {
      const { combinations, variants } = await productServices.get(
        combination?.productId,
      );
      const options = combinations.filter(
        (c: ProductCombination) =>
          c.id != combination.id &&
          (c.isBreakPackOfId === combination.id ||
            combination.isBreakPackOfId === c.id),
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

  const handleBreakPack = async (values: BreakPackInput) => {
    try {
      setLoading(true);
      await productCombinationServices.breakPack(values);
      productCombinationState.invalidate();
      onSubmit();
      toast.success("Break Pack successful");
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.VALIDATION_ERROR) {
        apiError.errors.forEach((err) => {
          if (err.field) {
            form.setError(err.field as keyof BreakPackInput, {
              type: "server",
              message: err.message,
            });
          }
        });
      } else {
        toast.error("Break Pack failed: " + apiError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (value: string) => {
    const selected = options.find((o) => o.id === Number(value));
    setSelected(selected);
    form.setValue("toCombinationId", Number(value));
  };

  const renderSelectOption = (option: ProductCombination) => (
    <SelectItem
      key={option.id}
      value={String(option.id)}
      className="w-full flex items-center justify-between gap-2 min-w-0 [&>span:last-of-type]:w-full"
    >
      <div className="flex items-center gap-2 w-full min-w-0">
        <ColorBadge colorMap={UNIT_COLOR}>{String(option.unit)}</ColorBadge>
        {option.name}
        <span className="ml-auto ">
          {getPackRelationType(combination, option) === "BREAK_PACK" && (
            <PackageOpen color="red" />
          )}
          {getPackRelationType(combination, option) === "RE_PACK" && (
            <PackagePlus color="green" />
          )}
        </span>
      </div>
    </SelectItem>
  );

  const handleFormSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log(form.getValues(), form.formState.errors);
    form.handleSubmit(handleBreakPack)(e);
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
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Quantity</FormLabel>
                        <NumberInput
                          {...field}
                          // type="number"
                          value={Number.parseFloat(String(field.value))}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col gap-2 ">
                    <div className="flex gap-2 items-center font-bold">
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
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            {selected && (
              <>
                <div className="flex gap-1 items-center border rounded-md bg-secondary px-2 py-1 text-sm">
                  {packType === "BREAK_PACK" && 1}
                  {packType === "RE_PACK" && Number(selected?.conversionFactor)}
                  <ColorBadge colorMap={UNIT_COLOR}>
                    {combination.unit}
                  </ColorBadge>
                  <Equal />
                  {packType === "BREAK_PACK" &&
                    Number(combination.conversionFactor)}
                  {packType === "RE_PACK" && 1}
                  <ColorBadge colorMap={UNIT_COLOR}>
                    {String(selected?.unit)}
                  </ColorBadge>
                </div>
                <Button
                  className="ml-auto"
                  type="button"
                  disabled={!selected || loading}
                  onClick={handleFormSubmit}
                >
                  {loading && <Loader2Icon className="animate-spin" />}
                  {packType === "BREAK_PACK" ? (
                    <>
                      <PackageOpen className="text-red-500" /> Break Pack
                    </>
                  ) : (
                    packType === "RE_PACK" && (
                      <>
                        <PackagePlus className="text-green-500" />
                        Re-Pack
                      </>
                    )
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </Form>
    </Modal>
  );
}

function getPackRelationType(
  fromCombo: ProductCombination,
  toCombo?: ProductCombination,
) {
  if (toCombo?.isBreakPackOfId === fromCombo.id) return "BREAK_PACK";
  if (fromCombo.isBreakPackOfId === toCombo?.id) return "RE_PACK";
  return null;
}
