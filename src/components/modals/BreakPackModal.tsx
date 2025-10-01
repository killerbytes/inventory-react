import {
  AlertCircleIcon,
  Equal,
  Loader2Icon,
  PackageOpen,
  X,
} from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { ApiErrorResponse, BreakPack, ProductCombinations } from "@/types";
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
}: {
  combination: ProductCombinations;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}) {
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

  React.useEffect(() => {
    const getData = async () => {
      try {
        const { combinations } = await productServices.get(
          combination?.productId,
        );

        const options = combinations.filter(
          (c: ProductCombinations) => c.id != combination.id,
        );
        setOptions(options);
      } catch (error) {
        const apiError = error as ApiErrorResponse;
        toast.error("Error fetching products: " + apiError.message);
      }
    };

    if (combination) {
      getData();
    }
  }, [combination]);

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

  return (
    <>
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
              Stock: {combination?.inventory?.quantity}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form className="flex flex-col gap-4">
            {options.length ? (
              <Select
                value={String(selected?.id)}
                options={options}
                onChange={(value) => {
                  setSelected(options.find((o) => o.id === Number(value)));
                  form.setValue("toCombinationId", Number(value));
                }}
                renderOption={(option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    <ColorBadge colorMap={UNIT_COLOR}>
                      {String(option.unit)}
                    </ColorBadge>
                    {option.name}
                  </SelectItem>
                )}
              />
            ) : (
              <>
                <Alert variant="destructive">
                  <AlertCircleIcon />

                  <AlertTitle>
                    No other units found with the same variation.
                  </AlertTitle>
                  <AlertDescription>
                    Please add a new combination to the product
                  </AlertDescription>
                </Alert>
              </>
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
                          <NumberInput {...field} type="number" />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2 items-center">
                      {quantity.field.value}
                      <ColorBadge colorMap={UNIT_COLOR}>
                        {String(combination.unit)}
                      </ColorBadge>
                      <X size={18} />
                      {combination.conversionFactor}
                      <Equal size={18} />
                      {quantity.field.value * combination.conversionFactor}
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
                onClick={(e) => {
                  e.preventDefault();
                  console.log(form.getValues(), form.formState.errors);
                  form
                    .handleSubmit(handleBreakPack)(e)
                    .catch((error) => {
                      console.error("Form submission error:", error);
                    });
                }}
              >
                {loading ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <PackageOpen />
                )}
                Break Pack
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </Modal>

      {/* {toggle.cloneModal && (
        <CloneToUnitModal
          redirect={false}
          isOpen={true}
          onSubmit={async () => {
            getProducts();
            handleToggle({ cloneModal: false });
          }}
          onClose={() => {
            handleToggle({ cloneModal: false });
          }}
          productId={Number(combination?.productId)}
        />
      )} */}
    </>
  );
}
