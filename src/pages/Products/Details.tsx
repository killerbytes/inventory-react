import { Card, CardContent } from "@/components/ui/card";

import {
  useProduct,
  useUpdateProduct,
} from "@/features/products/hooks/useProducts";
import CreateProductModal from "@/features/products/components/CreateProductModal";
import ProductComboSearchCommand from "@/components/ProductComboSearchCommand";
import { ApiErrorResponse, productBaseSchema, ProductInput } from "@/schemas";
import BarcodePrinter from "@/features/products/components/BarcodePrinter";
import VariantsModal from "@/features/products/components/VariantsModal";
import { Edit, Loader2Icon, PlusIcon, Save, Search } from "lucide-react";
import Combinations from "@/features/products/components/Combinations";
import ProductForm from "@/features/products/components/ProductForm";
import { getMappedSearchProductCombinations } from "@/lib/utils";
import { ERROR, ROUTES, UNIT_COLOR } from "@/utils/definitions";
import Variants from "@/features/products/components/Variants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCategories } from "@/hooks/useCategories";
import { useNavigate, useParams } from "react-router";
import { hasRole, ROLES } from "@/utils/permissions";
import PageHeader from "@/components/PageHeader";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import useToggle from "@/hooks/useToggle";
import { useForm } from "react-hook-form";
import Loader from "@/components/Loader";
import React, { Fragment } from "react";
import { useStore } from "@/stores";
import { toast } from "sonner";

export default function ProductDetails() {
  const { authState } = useStore();
  const { id } = useParams();

  const { mutate: updateProduct, isPending } = useUpdateProduct();
  const {
    data: product,
    isError,
    error,
    isLoading,
    isFetching,
  } = useProduct(Number(id));

  const [isEditing, setIsEditing] = React.useState(false);
  const { data: categories } = useCategories();

  const navigate = useNavigate();
  const form = useForm<ProductInput>({
    resolver: zodResolver(productBaseSchema),
    values: product,
  });
  const [toggle, handleToggle] = useToggle({
    variantModal: false,
    createProductModal: false,
    barcodePrinter: false,
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
          setIsEditing(false);
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

  return (
    <Fragment key={id}>
      <PageHeader
        title="Products"
        description="Manage your products and variants"
      >
        <ProductComboSearchCommand
          onSearch={onSearch}
          onSelect={(item) => navigate(`${ROUTES.PRODUCTS}/${item.productId}`)}
        >
          <Button variant="outline" size="sm">
            <Search />
          </Button>
        </ProductComboSearchCommand>
        {hasRole(authState.user.role, [ROLES.ADMIN, ROLES.MANAGER]) && (
          <Button
            size="icon"
            className="size-8 shadow-sm"
            onClick={() => {
              handleToggle({ createProductModal: true });
            }}
          >
            <PlusIcon />
          </Button>
        )}
      </PageHeader>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <Card>
            <CardContent>
              {isEditing ? (
                <Form {...form}>
                  <form
                    className="h-full flex flex-col gap-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                  >
                    <ProductForm form={form} categories={categories || []} />
                    <div className="flex justify-end gap-2">
                      <Button
                        className="shadow-sm"
                        type="button"
                        variant="secondary"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
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
              ) : (
                <>
                  <div className="flex justify-between">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col ">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">
                          Product Name
                        </span>
                        <span>{product?.name || "N/A"}</span>
                      </div>
                      <div className="flex flex-col ">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">
                          Category
                        </span>
                        <span>
                          {categories?.find((c) => c.id === product?.categoryId)
                            ?.name || "Uncategorized"}
                        </span>
                      </div>
                      <div className="flex flex-col ">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">
                          Base Unit
                        </span>
                        <span>
                          <ColorBadge colorMap={UNIT_COLOR}>
                            {product?.baseUnit}
                          </ColorBadge>
                        </span>
                      </div>
                      <div className="flex flex-col ">
                        <span className="text-xs uppercase tracking-wider  text-muted-foreground">
                          Description
                        </span>
                        <span
                          className="font-medium text-foreground truncate"
                          title={product?.description || ""}
                        >
                          {product?.description || "No description"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        className="shadow-sm"
                        variant="secondary"
                        onClick={() => {
                          handleToggle({ barcodePrinter: true });
                        }}
                      >
                        Print Barcode
                      </Button>
                      {hasRole(authState.user.role, [
                        ROLES.ADMIN,
                        ROLES.MANAGER,
                      ]) && (
                        <Button
                          className="shadow-sm"
                          type="button"
                          variant="secondary"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          <Variants
            variants={product?.variants || []}
            handleToggle={handleToggle}
          />

          <Combinations id={id} product={product} />
        </>
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

      <BarcodePrinter
        isOpen={toggle.barcodePrinter || false}
        onClose={() => handleToggle({ barcodePrinter: false })}
        items={product?.combinations || []}
      />
    </Fragment>
  );
}
