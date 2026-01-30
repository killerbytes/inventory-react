import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/PageHeader";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ApiErrorResponse,
  Product,
  ProductCombinations,
  VariantTypes,
} from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductComboSearchCommand from "@/components/ProductComboSearchCommand";
import { Loader2Icon, Pencil, PlusIcon, Save, Search } from "lucide-react";
import { getMappedSearchProductCombinations } from "@/lib/utils";
import { categoryServices, productServices } from "@/services";
import PriceHistory from "@/pages/Products/PriceHistory";
import { zodResolver } from "@hookform/resolvers/zod";
import CreateProductModal from "./CreateProductModal";
import { useNavigate, useParams } from "react-router";
import { SelectItem } from "@/components/ui/select";
import { ERROR, ROUTES } from "@/utils/definitions";
import CombinationModal from "./CombinationModal";
import { Button } from "@/components/ui/button";
import SupplierHistory from "./SupplierHistory";
import ProductHistory from "./ProductHistory";
import { Form } from "@/components/ui/form";
import VariantsModal from "./VariantsModal";
import useToggle from "@/hooks/useToggle";
import { useForm } from "react-hook-form";
import Combinations from "./Combinations";
import { productSchema } from "@/schemas";
import Select from "@/components/Select";
import Loader from "@/components/Loader";
import ProductForm from "./ProductForm";
import React, { Fragment } from "react";
import { useStore } from "@/stores";
import Variants from "./Variants";
import { toast } from "sonner";

const defaultOption = { id: -1, name: "ALL" };

export default function ProductEdit() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = React.useState("product_combination");
  const {
    categoryState: { hasLoaded: categoryHasLoaded, categories, setCategories },
  } = useStore();
  const [loading, setLoading] = React.useState(false);
  const { productCombinationState } = useStore();
  const [selectedCombination, setSelectedCombination] = React.useState<string>(
    String(defaultOption.id),
  );
  const [combinations, setCombinations] = React.useState<ProductCombinations[]>(
    [],
  );
  const [variants, setVariants] = React.useState<VariantTypes[]>([]);
  const navigate = useNavigate();
  const form = useForm<Product>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
    },
  });
  const [toggle, handleToggle] = useToggle({
    variantModal: false,
    combinationModal: false,
    createProductModal: false,
  });
  async function onSubmit(values: Product) {
    try {
      setLoading(true);
      await productServices.update(Number(id), values);
      getData();
      productCombinationState.invalidate();
      toast.success("Product updated successfully");
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.VALIDATION_ERROR) {
        apiError.errors.forEach((err) => {
          if (err.field) {
            form.setError(err.field as keyof Product, {
              type: "server",
              message: err.message,
            });
          }
        });
      }
    } finally {
      setLoading(false);
    }
  }
  const getData = React.useCallback(async () => {
    try {
      setLoading(true);
      const product: Product = await productServices.get(Number(id));
      const { combinations, variants, ...rest }: Product = product;
      setCombinations(combinations ?? []);
      setVariants(variants ?? []);

      form.reset({
        ...rest,
      });
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.NOT_FOUND) {
        navigate(`${ROUTES.PRODUCTS}`);
      }
      toast.error(apiError.message);
    } finally {
      setLoading(false);
    }
  }, [form, id, navigate]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  React.useEffect(() => {
    const getData = async () => {
      if (!categoryHasLoaded) {
        const data = await categoryServices.list();
        setCategories(data);
      }
    };
    getData();
  }, [categories.length, categoryHasLoaded, setCategories]);

  const onSearch = React.useCallback(async (search: string) => {
    return await getMappedSearchProductCombinations({ search });
  }, []);

  const uniqueCombinations = React.useMemo(() => {
    return combinations.filter(
      (item, index) =>
        combinations.findIndex((i) => i.name === item.name) === index,
    );
  }, [combinations]);

  const breakPackFilter = React.useMemo(() => {
    return variants.find((item) => item.isBreakpackFilter);
  }, [variants]);

  const selectedCombo = React.useMemo<{
    id: number;
    name: string;
  }>(() => {
    if (breakPackFilter) {
      const found = breakPackFilter?.values.find(
        (i) => i.id === Number(selectedCombination),
      );

      if (found) {
        return {
          id: found.id!,
          name: found.value,
        };
      }
    }

    return (
      uniqueCombinations.find((i) => i.id === Number(selectedCombination)) || {
        id: -1,
        name: "ALL",
      }
    );
  }, [breakPackFilter, selectedCombination, uniqueCombinations]);

  return (
    <Fragment key={id}>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Products</PageHeaderTitle>
          <PageHeaderDescription>
            Manage your products and variants
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <ProductComboSearchCommand
            onSearch={onSearch}
            onSelect={(item) =>
              navigate(`${ROUTES.PRODUCTS}/${item.productId}`)
            }
          >
            <Button variant="outline" size="sm">
              <Search />
            </Button>
          </ProductComboSearchCommand>
          <Button
            size="icon"
            className="size-8 shadow-sm"
            onClick={() => {
              handleToggle({ createProductModal: true });
            }}
          >
            <PlusIcon />
          </Button>
        </PageHeaderActions>
      </PageHeader>
      {loading ? (
        <Loader />
      ) : (
        <Form {...form}>
          <form
            className="h-full flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              console.log(form.formState.errors);
              form
                .handleSubmit(onSubmit)(e)
                .catch((error) => {
                  console.error("Form submission error:", error);
                });
            }}
          >
            <Card>
              <CardContent>
                <ProductForm
                  form={form}
                  onSubmit={onSubmit}
                  categories={categories}
                />
                <div className="flex justify-end">
                  <Button
                    className="shadow-sm"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2Icon className="animate-spin" />
                    ) : (
                      <Save />
                    )}
                    Save changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full xsm:w-fit flex items-center justify-start flex-nowrap overflow-x-auto md:overflow-x-visible">
                <TabsTrigger value="product_combination">
                  Product Combinations
                </TabsTrigger>
                <TabsTrigger value="variants">Variants</TabsTrigger>
                <TabsTrigger value="price_history">Price History</TabsTrigger>
                <TabsTrigger value="supplier_history">
                  Supplier History
                </TabsTrigger>
                <TabsTrigger value="product_history">
                  Product History
                </TabsTrigger>
              </TabsList>
              {!breakPackFilter && uniqueCombinations.length > 1 && (
                <Select
                  options={[defaultOption, ...uniqueCombinations]}
                  value={String(selectedCombination)}
                  onChange={(value) => {
                    setSelectedCombination(value);
                  }}
                  renderOption={(option) => (
                    <SelectItem key={option.id} value={String(option.id)}>
                      {option.name}
                    </SelectItem>
                  )}
                />
              )}

              {breakPackFilter && breakPackFilter.values.length > 1 && (
                <Select
                  options={[
                    { id: -1, value: "ALL" },
                    ...breakPackFilter.values,
                  ]}
                  value={String(selectedCombination)}
                  onChange={(value) => {
                    setSelectedCombination(value);
                  }}
                  renderOption={(option) => (
                    <SelectItem key={option.id} value={String(option.id)}>
                      {breakPackFilter.name}: {option.value}
                    </SelectItem>
                  )}
                />
              )}
              <TabsContent value="product_combination">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Combinations</CardTitle>
                    <CardAction>
                      <Button
                        onClick={() => handleToggle({ combinationModal: true })}
                        type="button"
                        variant="outline"
                        className="shadow-sm"
                      >
                        <Pencil />
                        Edit Combinations
                      </Button>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <Combinations
                      combinations={combinations}
                      variants={variants}
                      getData={getData}
                      selectedCombination={selectedCombo}
                      isBreakPackFilter={!!breakPackFilter}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="variants">
                <Card>
                  <CardHeader>
                    <CardTitle>Variants</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <Variants variants={variants} handleToggle={handleToggle} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="price_history">
                <Card>
                  <CardHeader>
                    <CardTitle>Price History</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <PriceHistory
                      productId={id ?? ""}
                      selectedCombination={selectedCombo}
                      isBreakPackFilter={!!breakPackFilter}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="supplier_history">
                <Card>
                  <CardHeader>
                    <CardTitle>Supplier History</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <SupplierHistory
                      productId={id ?? ""}
                      selectedCombination={selectedCombo}
                      isBreakPackFilter={!!breakPackFilter}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="product_history">
                <Card>
                  <CardHeader>
                    <CardTitle>Product History</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <ProductHistory
                      productName={form.getValues().name}
                      selectedCombination={selectedCombo}
                      isBreakPackFilter={!!breakPackFilter}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      )}
      {/* {JSON.stringify(x)} */}
      {toggle.combinationModal && (
        <CombinationModal
          product={form.getValues()}
          isOpen={true}
          onSubmit={onSubmit}
          onClose={(shouldReload) => {
            if (shouldReload) {
              getData();
              productCombinationState.invalidate();
            }
            handleToggle({ combinationModal: false });
            setActiveTab("product_combination");
          }}
        />
      )}

      {toggle.variantModal && (
        <VariantsModal
          productId={Number(id)}
          isOpen={true}
          onClose={(shouldOpenComboModal) => {
            handleToggle({ variantModal: false });
            if (shouldOpenComboModal) {
              handleToggle({ combinationModal: true });
            }
          }}
        />
      )}

      {toggle.createProductModal && (
        <CreateProductModal
          isOpen={true}
          onClose={() => {
            handleToggle({ createProductModal: false });
          }}
        />
      )}
    </Fragment>
  );
}
