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
import { zodResolver } from "@hookform/resolvers/zod";
import CreateProductModal from "./CreateProductModal";
import { useNavigate, useParams } from "react-router";
import { ERROR, ROUTES } from "@/utils/definitions";
import CombinationModal from "./CombinationModal";
import { Button } from "@/components/ui/button";
import CombinationsTab from "./CombinationsTab";
import { Form } from "@/components/ui/form";
import useToggle from "@/hooks/useToggle";
import { useForm } from "react-hook-form";
import { productSchema } from "@/schemas";
import Loader from "@/components/Loader";
import ProductForm from "./ProductForm";
import React, { Fragment } from "react";
import { useStore } from "@/stores";
import Variants from "./Variants";
import { toast } from "sonner";

export default function ProductEdit() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = React.useState("product_combination");
  const {
    categoryState: { hasLoaded: categoryHasLoaded, categories, setCategories },
  } = useStore();
  const [loading, setLoading] = React.useState(false);
  const { productCombinationState } = useStore();
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
              </TabsList>
              <TabsContent value="product_combination">
                <Card>
                  <CombinationsTab
                    combinations={combinations}
                    variants={variants}
                    getData={getData}
                    form={form}
                  />
                </Card>
              </TabsContent>
              <TabsContent value="variants">
                <Card>
                  <CardHeader>
                    <CardTitle>Variants</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <Variants variants={variants} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      )}
      {/* {JSON.stringify(x)} */}

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
