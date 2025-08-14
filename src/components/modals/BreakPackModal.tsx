import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  ApiErrorResponse,
  BreakPack,
  Product,
  ProductCombinations,
} from "@/types";
import { AlertCircleIcon, Copy, MoveRight, PackageOpen, X } from "lucide-react";
import { productCombinationServices, productServices } from "@/services";
import CloneToUnitModal from "@/components/modals/CloneToUnitModal";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { DialogFooter } from "../ui/dialog";
import { breakPackSchema } from "@/schemas";
import useToggle from "@/hooks/useToggle";
import { SelectItem } from "../ui/select";
import NumberInput from "../NumberInput";
import React, { useMemo } from "react";
import UnitBadge from "../ColorBadge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
  const [key, setKey] = React.useState(0);

  const form = useForm<BreakPack>({
    resolver: zodResolver(breakPackSchema),
    defaultValues: {
      fromComboId: combinationId,
      packsCount: 1,
      reason: "",
    },
  });

  const packsCount = useWatch({ control: form.control, name: "packsCount" });
  const unitsPerPack = useWatch({
    control: form.control,
    name: "unitsPerPack",
  });

  const resultCount = useMemo(() => {
    return packsCount * unitsPerPack;
  }, [packsCount, unitsPerPack]);

  const product = useMemo(() => {
    return combination?.product;
  }, [combination?.product]);

  const selectedUnit = useMemo(() => {
    return products.find((p) => p.id === selected?.productId)?.unit ?? "";
  }, [selected?.productId, products]);

  React.useEffect(() => {
    const getProductCombination = async () => {
      const combination = await productCombinationServices.get(combinationId);
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
      const map = combination?.values.map((i) => i.value).join(":");
      const options: ProductCombinations[] = [];
      products
        .filter((p) => p.unit !== product?.unit)
        .forEach((p) => {
          p.combinations?.forEach((combo) => {
            console.log(combo.values.map((i) => i.value).join(":"), "x", map);
            if (combo.values.map((i) => i.value).join(":") === map) {
              options.push(combo);
            }
          });
        });

      // console.log(
      //   product.unit,
      //   products.filter((p) => p.unit !== product?.unit),
      // );
      setOptions(options);
    };
    if (product?.sku) {
      getData();
    }
  }, [combination?.values, product?.sku, product?.unit, products]);
  const handleBreakPack = async (values: BreakPack) => {
    try {
      if ((combination?.inventory?.quantity ?? 0) < values.packsCount) {
        form.setError("packsCount", {
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
        key={key}
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
                  form.setValue("toComboId", Number(value));
                  console.log(
                    value,
                    options.find((o) => o.id === Number(value)),
                  );
                }}
                renderOption={(option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    <UnitBadge>
                      {String(
                        products.find((p) => p.id === option.productId)?.unit ??
                          "",
                      )}
                    </UnitBadge>
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
                  name="packsCount"
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
                {selected && (
                  <>
                    <div className="pt-8">
                      <X size={20} />
                    </div>
                    <FormField
                      control={form.control}
                      name="unitsPerPack"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Unit</FormLabel>
                          <NumberInput
                            {...field}
                            type="number"
                            placeholder={`eg: 1 ${combination?.product?.unit} = 12${selectedUnit}`}
                          />
                          <FormDescription className="flex gap-1">
                            Unit per
                            <UnitBadge className="text-[10px] py-0.5">
                              {combination?.product?.unit}
                            </UnitBadge>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
              <div className="flex gap-2 justify-between">
                <div>
                  <div className="flex gap-2 justify-center">
                    <Badge variant="outline">{packsCount}</Badge>
                    {combination?.product?.unit && (
                      <UnitBadge>{combination?.product?.unit}</UnitBadge>
                    )}
                    {combination?.values.map((i) => (
                      <Badge key={i.id} variant="outline">
                        {i.value}
                      </Badge>
                    ))}
                  </div>
                </div>
                {selected && (
                  <>
                    <div className="text-green-500 ">
                      <MoveRight />
                    </div>
                    <div>
                      <div className="flex gap-2 justify-center">
                        <Badge variant="outline">
                          {resultCount > 0 ? resultCount : 0}
                        </Badge>
                        <UnitBadge>{selectedUnit}</UnitBadge>

                        {selected?.values?.map((i) => (
                          <Badge key={i.value} variant="outline">
                            {i.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Reason</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

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
