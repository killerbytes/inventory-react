import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Copy,
  EllipsisVertical,
  PackageOpen,
  Pencil,
  Save,
} from "lucide-react";
import CloneToUnitModal from "../../components/modals/CloneToUnitModal";
import { BREAK_PACK_UNITS, ERROR, ROUTES } from "@/utils/definitions";
import BreakPackModal from "@/components/modals/BreakPackModal";
import { categoryServices, productServices } from "@/services";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ColumnDef, Row } from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import { DataTable } from "@/components/DataTable";
import CombinationModal from "./CombinationModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form } from "@/components/ui/form";
import VariantsModal from "./VariantsModal";
import { useCategoryStore } from "@/stores";
import useToggle from "@/hooks/useToggle";
import { useForm } from "react-hook-form";
import { productSchema } from "@/schemas";
import ProductForm from "./ProductForm";
import React, { Fragment } from "react";
import { toast } from "sonner";

export default function ProductEdit() {
  const { id } = useParams();
  const [product, setProduct] = React.useState<Product>();
  const { categories, setCategories } = useCategoryStore();
  const [combinations, setCombinations] = React.useState<ProductCombinations[]>(
    [],
  );
  const [breakPackSelected, setBreakPackSelected] =
    React.useState<ProductCombinations | null>(null);
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
    cloneModal: false,
    breakPackModal: false,
  });

  async function onSubmit(values: Product) {
    try {
      await productServices.update(String(id), values);
      getData();
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      console.log(apiError);
      if (apiError.code === ERROR.VALIDATION_ERROR) {
        apiError.errors.forEach((err) => {
          if (err.field) {
            form.setError(err.field as keyof Product, {
              type: "server",
              message: err.message,
            });
          }
        });
        // if (form.formState.errors["products_name_unit"]) {
        //   form.setError("name", {
        //     type: "server",
        //     message: "Product with the same unit already exists",
        //   });
        //   form.setError("unit", {
        //     type: "server",
        //     message: "Unit with same product already exists",
        //   });
        // }
        // toast.error("Submission failed: " + message);
      }
    }
  }
  const getData = React.useCallback(async () => {
    try {
      const product: Product = await productServices.get(String(id));
      setProduct(product);
      const { combinations, variants, ...rest }: Product = product;
      setCombinations(combinations ?? []);
      setVariants(variants ?? []);
      // const updateCombo = (data: VariantValues[]) => {
      //   const combo = [];
      //   for (const entry of variants) {
      //     const found = data.find((i) => i.variantTypeId === entry.id);
      //     if (found) {
      //       combo.push(found);
      //     } else {
      //       combo.push({ value: "", variantTypeId: entry.id });
      //     }
      //   }
      //   return combo;
      // };

      form.reset({
        ...rest,
        // variants,
        // combinations: combinations.map((i) => {
        //   return {
        //     ...i,
        //     values: updateCombo(i.values),
        //   };
        // }),
      });
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      if (apiError.code === ERROR.NOT_FOUND) {
        navigate(`${ROUTES.PRODUCTS}`);
      }
      toast.error(apiError.message);
    }
  }, [form, id, navigate]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  React.useEffect(() => {
    const getData = async () => {
      const data = await categoryServices.list();
      setCategories(data);
    };
    if (categories.length === 0) {
      getData();
    }
  }, [categories.length, setCategories]);

  const columns = React.useMemo<ColumnDef<ProductCombinations>[]>(
    () => [
      // {
      //   accessorKey: "sku",
      //   header: "SKU",
      //   meta: {
      //     className: "w-50",
      //   },
      // },
      ...variants.map((variant, idx) => ({
        accessorKey: "values.values." + variant.name,
        header: variant.name,
        cell: ({ row }: { row: Row<ProductCombinations> }) => {
          return row.original.values[idx]?.value;
        },
      })),
      {
        accessorKey: "price",
        header: "Price",
      },
      {
        header: "Quantity",
        accessorKey: "inventory.quantity",
      },
      {
        header: "Re-order Level",
        accessorKey: "reorderLevel",
      },
      ...(BREAK_PACK_UNITS.includes(product?.unit)
        ? [
            {
              accessorKey: "id",
              header: "Break",
              meta: {
                className: "w-0",
              },
              cell: ({ row }) => (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shadow-sm"
                  disabled={
                    row.original?.inventory?.quantity === 0 ||
                    row.original?.inventory?.quantity === undefined
                  }
                  onClick={() => {
                    setBreakPackSelected(row.original);
                    handleToggle({ breakPackModal: true });
                  }}
                >
                  <PackageOpen />
                </Button>
              ),
            },
          ]
        : []),
    ],
    [handleToggle, variants],
  );
  return (
    <Fragment key={id}>
      {/* <Button onClick={handleClone}>Clone</Button> */}

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
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SidebarTrigger />
                <div className="bg-border h-5 w-[1px]"></div>
                Product Details
              </CardTitle>
              <CardAction>
                <div className="flex gap-2">
                  <div className="ml-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-8 shadow-sm"
                        >
                          <EllipsisVertical />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              handleToggle({ cloneModal: true });
                            }}
                          >
                            <Copy />
                            Clone to Unit
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardAction>
            </CardHeader>
            <CardContent>
              <ProductForm
                form={form}
                onSubmit={onSubmit}
                categories={categories}
              />
              <div className="flex justify-end">
                <Button className="shadow-sm" type="submit">
                  <Save />
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Variant Types</CardTitle>
              <CardAction>
                <Button
                  onClick={() => handleToggle({ variantModal: true })}
                  type="button"
                  variant="outline"
                  className="shadow-sm"
                >
                  <Pencil />
                  Edit Variants
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant, idx) => {
                  return (
                    <Badge variant="secondary" key={idx} className="outline">
                      {variant.name}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Product Variations</CardTitle>
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

            <CardContent>
              <DataTable
                data={combinations || []}
                columns={columns}
                className="mb-4"
              />
            </CardContent>
          </Card>
        </form>
      </Form>
      {/* {JSON.stringify(data)} */}
      {toggle.variantModal && (
        <VariantsModal
          productId={Number(id)}
          isOpen={true}
          onClose={() => {
            handleToggle({ variantModal: false });
            getData();
          }}
        />
      )}
      {toggle.combinationModal && (
        <CombinationModal
          product={form.getValues()}
          isOpen={true}
          onSubmit={onSubmit}
          onClose={() => {
            getData();
            handleToggle({ combinationModal: false });
          }}
        />
      )}
      {toggle.cloneModal && (
        <CloneToUnitModal
          isOpen={true}
          onSubmit={async (product) => {
            navigate(`${ROUTES.PRODUCTS}/${product.id}/edit`);
            handleToggle({ cloneModal: false });
          }}
          onClose={() => {
            handleToggle({ cloneModal: false });
          }}
          productId={Number(id)}
        />
      )}
      {toggle.breakPackModal && ( // && breakPackSelected
        <BreakPackModal
          isOpen={true}
          onClose={() => {
            handleToggle({ breakPackModal: false });
          }}
          combinationId={Number(breakPackSelected?.id)}
          onSubmit={async (productId) => {
            handleToggle({ breakPackModal: false });
            navigate(`${ROUTES.PRODUCTS}/${productId}/edit`);
          }}
        />
      )}
    </Fragment>
  );
}
