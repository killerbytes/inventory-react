import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  ApiErrorResponse,
  productBaseSchema,
  ProductInput,
  ProductWithCombinations,
} from "@/schemas";
import {
  useProduct,
  useUpdateProduct,
} from "@/features/products/hooks/useProducts";
import SupplierHistoryTab from "@/features/products/components/SupplierHistoryTab";
import CreateProductModal from "@/features/products/components/CreateProductModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductComboSearchCommand from "@/components/ProductComboSearchCommand";
import ProductHistory from "@/features/products/components/ProductHistory";
import VariantsModal from "@/features/products/components/VariantsModal";
import PriceHistory from "@/features/products/components/PriceHistory";
import Combinations from "@/features/products/components/Combinations";
import ProductForm from "@/features/products/components/ProductForm";
import { Loader2Icon, PlusIcon, Save, Search } from "lucide-react";
import { getMappedSearchProductCombinations } from "@/lib/utils";
import Variants from "@/features/products/components/Variants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCategories } from "@/hooks/useCategories";
import { useNavigate, useParams } from "react-router";
import { ERROR, ROUTES } from "@/utils/definitions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import useToggle from "@/hooks/useToggle";
import { useForm } from "react-hook-form";
import Loader from "@/components/Loader";
import React, { Fragment } from "react";
import { toast } from "sonner";

export type ComboboxItem = {
  id: number;
  name?: string;
  value?: string;
};

export default function ProductEdit() {
  const { id } = useParams();

  const { mutate: updateProduct, isPending } = useUpdateProduct();
  const {
    data: product,
    isError,
    error,
    isLoading,
    isFetching,
  } = useProduct(Number(id));

  const [activeTab, setActiveTab] = React.useState("product_combination");
  const { data: categories } = useCategories();
  const [selectedCombination, setSelectedCombination] = React.useState<
    ComboboxItem | undefined
  >();
  const navigate = useNavigate();
  const form = useForm<ProductInput>({
    resolver: zodResolver(productBaseSchema),
    values: product,
  });
  const [toggle, handleToggle] = useToggle({
    variantModal: false,
    createProductModal: false,
  });
  async function onSubmit(values: ProductInput) {
    updateProduct(
      {
        id: Number(id),
        data: values,
      },
      {
        onSuccess: () => {
          toast.success("Product updated successfully");
        },
        onError: (error) => {
          const apiError = error as unknown as ApiErrorResponse;

          if (apiError.code === ERROR.VALIDATION_ERROR) {
            apiError.errors.forEach((err) => {
              if (err.field) {
                form.setError(err.field as keyof ProductInput, {
                  type: "server",
                  message: err.message,
                });
              }
            });
          }
        },
      },
    );
  }

  if (isError) {
    if (error.code === ERROR.NOT_FOUND) {
      navigate(`${ROUTES.PRODUCTS}`);
    }
    toast.error(error.message);
  }

  const onSearch = React.useCallback(async (search: string) => {
    return await getMappedSearchProductCombinations({ search });
  }, []);

  const uniqueCombinations = React.useMemo(() => {
    return (
      product?.combinations.filter(
        (item, index) =>
          product?.combinations.findIndex((i) => i.name === item.name) ===
          index,
      ) || []
    );
  }, [product]);

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
      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent>
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
                  <ProductForm form={form} categories={categories || []} />
                  <div className="flex justify-end">
                    <Button
                      className="shadow-sm"
                      type="submit"
                      disabled={isPending || isFetching}
                    >
                      {isPending || isFetching ? (
                        <Loader2Icon className="animate-spin" />
                      ) : (
                        <Save />
                      )}
                      Save changes
                    </Button>
                  </div>
                </form>
              </Form>
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
              <TabsTrigger value="product_history">Product History</TabsTrigger>
            </TabsList>
            {/* {uniqueCombinations.length > 1 && (
              <Combobox<ComboboxItem>
                items={[...uniqueCombinations]}
                itemToStringLabel={(item) => item?.name || ""}
                value={selectedCombination}
                onValueChange={(value) => {
                  setSelectedCombination(value || undefined);
                }}
              >
                <ComboboxInput placeholder="Filter by combination" showClear />
                <ComboboxContent>
                  <ComboboxEmpty>No items found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item.id} value={item}>
                        <ColorBadge colorMap={UNIT_COLOR}>
                          {item.unit}
                        </ColorBadge>
                        {item.name}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )} */}

            <TabsContent value="product_combination">
              <Combinations product={product as ProductWithCombinations} />
            </TabsContent>
            <TabsContent value="variants">
              <Card>
                <CardHeader>
                  <CardTitle>Variants</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <Variants
                    variants={product?.variants || []}
                    handleToggle={handleToggle}
                  />
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
                    selectedCombination={selectedCombination}
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
                  <SupplierHistoryTab
                    productId={id ?? ""}
                    selectedCombination={selectedCombination}
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
                    selectedCombination={selectedCombination}
                    combinations={product?.combinations || []}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
      {/* {JSON.stringify(x)} */}

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
