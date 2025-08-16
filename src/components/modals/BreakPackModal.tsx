import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  AlertCircleIcon,
  Copy,
  MoveDown,
  MoveRight,
  PackageOpen,
} from "lucide-react";
import {
  ApiErrorResponse,
  BreakPack,
  Product,
  ProductCombinations,
} from "@/types";
import { productCombinationServices, productServices } from "@/services";
import CloneToUnitModal from "@/components/modals/CloneToUnitModal";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { getMappedProductComboName } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { UNIT_COLOR } from "@/utils/definitions";
import { DialogFooter } from "../ui/dialog";
import { breakPackSchema } from "@/schemas";
import useToggle from "@/hooks/useToggle";
import { SelectItem } from "../ui/select";
import NumberInput from "../NumberInput";
import ColorBadge from "../ColorBadge";
import React, { useMemo } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import Select from "../Select";
import { toast } from "sonner";
import Modal from "../Modal";

export default function BreakPackModal({
  combinationId,
  isOpen,
  onClose,
  onSubmit,
}: {
  combinationId: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productId: number) => Promise<void>;
}) {
  const [combination, setCombination] = React.useState<ProductCombinations>();
  const [options, setOptions] = React.useState<ProductCombinations[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selected, setSelected] = React.useState<ProductCombinations>();
  const [toggle, handleToggle] = useToggle({
    cloneModal: false,
  });

  const form = useForm<BreakPack>({
    resolver: zodResolver(breakPackSchema),
    defaultValues: {
      fromCombinationId: combinationId,
      quantity: 1,
    },
  });

  const quantity = useWatch({ control: form.control, name: "quantity" });
  const conversionFactor = useWatch({
    control: form.control,
    name: "conversionFactor",
  });

  const resultCount = useMemo(() => {
    console.log(quantity, conversionFactor);
    return quantity * conversionFactor;
  }, [quantity, conversionFactor]);

  const product = useMemo(() => {
    return combination?.product;
  }, [combination?.product]);

  const selectedUnit = useMemo(() => {
    return products.find((p) => p.id === selected?.productId)?.unit ?? "";
  }, [selected?.productId, products]);

  React.useEffect(() => {
    const getProductCombination = async () => {
      const combination = await productCombinationServices.get(combinationId);
      form.setValue("conversionFactor", combination.product.conversionFactor);
      setCombination(combination);
    };
    getProductCombination();
  }, [combinationId]);

  const getProducts = React.useCallback(async () => {
    const products = await productServices.getBySku(String(product?.sku));
    setProducts(products);
  }, [product?.sku]);

  React.useEffect(() => {
    if (product?.sku) {
      getProducts();
    }
  }, [getProducts, product?.sku]);

  React.useEffect(() => {
    const getData = async () => {
      const map = getMappedProductComboName(
        combination?.product,
        combination?.values,
      );

      const options: ProductCombinations[] = [];
      products
        .filter((p) => p.unit !== product?.unit)
        .forEach((p) => {
          console.log(p);
          p.combinations?.forEach((combo) => {
            if (getMappedProductComboName(p, combo.values) === map) {
              options.push({ ...combo, product: p });
            }
          });
        });
      setOptions(options);
    };
    if (product?.sku) {
      getData();
    }
  }, [
    combination?.product,
    combination?.values,
    product?.sku,
    product?.unit,
    products,
  ]);

  const handleBreakPack = async (values: BreakPack) => {
    try {
      if ((combination?.inventory?.quantity ?? 0) < values.quantity) {
        form.setError("quantity", {
          type: "manual",
          message: "Not enough stock",
        });
        return;
      }
      const res = await productCombinationServices.breakPack(values);
      onSubmit(res.productId);
      toast.success("Break Pack successful");
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      apiError.errors.forEach((err) => {
        if (err.field) {
          form.setError(err.field as keyof BreakPack, {
            type: "server",
            message: err.message,
          });
        }
      });
      toast.error("Break Pack failed: " + apiError.message);
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
                      {String(
                        products.find((p) => p.id === option.productId)?.unit ??
                          "",
                      )}
                    </ColorBadge>
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
                    Please add a new variation to the product or use the Clone
                    to Unit function.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    className="shadow-sm"
                    type="button"
                    onClick={() => handleToggle({ cloneModal: true })}
                  >
                    <Copy /> Clone to Unit
                  </Button>
                </div>
              </>
            )}

            <div>
              <div className="flex gap-2 justify-between items-start">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Quantity</FormLabel>
                      <NumberInput {...field} type="number" />
                      <FormDescription>
                        Stock: {combination?.inventory?.quantity}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2  ">
                <div className="flex gap-2 justify-center">
                  <Badge variant="outline">{quantity}</Badge>
                  {combination?.product?.unit && (
                    <ColorBadge colorMap={UNIT_COLOR}>
                      {combination?.product?.unit}
                    </ColorBadge>
                  )}
                  {getMappedProductComboName(
                    combination?.product,
                    combination?.values,
                  )}
                </div>

                {selected && (
                  <>
                    <div className="text-green-500 flex justify-center">
                      <MoveDown />
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Badge variant="outline">
                        {resultCount > 0 ? resultCount : 0}
                      </Badge>
                      <ColorBadge colorMap={UNIT_COLOR}>
                        {selectedUnit}
                      </ColorBadge>
                      {getMappedProductComboName(
                        selected?.product,
                        selected?.values,
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
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
                <PackageOpen />
                Break Pack
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </Modal>

      {toggle.cloneModal && (
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
      )}
    </>
  );
}
