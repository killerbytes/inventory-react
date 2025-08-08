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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ApiErrorResponse,
  Product,
  ProductCombinations,
  VariantTypes,
} from "@/types";
import { categoryServices, productServices } from "@/services";
import { Copy, EllipsisVertical, Pencil } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import { ERROR, ROUTES } from "@/utils/definitions";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import CombinationModal from "./CombinationModal";
import CloneToUnitModal from "./CloneToUnitModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getErrorMessage } from "@/lib/utils";
import { Form } from "@/components/ui/form";
import VariantsModal from "./VariantsModal";
import { useCategoryStore } from "@/stores";
import useToggle from "@/hooks/useToggle";
import { useForm } from "react-hook-form";
import { productSchema } from "@/schemas";
import ProductForm from "./ProductForm";
import React, { Fragment } from "react";

export default function ProductEdit() {
  const { id } = useParams();
  const { categories, setCategories } = useCategoryStore();
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
    cloneModal: false,
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
  console.log(form.formState.errors);
  const getData = React.useCallback(async () => {
    try {
      const { combinations, variants, ...rest }: Product =
        await productServices.get(String(id));
      setCombinations(combinations);
      setVariants(variants);
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
      const x = getErrorMessage(error as ApiErrorResponse);
      if (x.statusCode === 404) {
        navigate(`${ROUTES.PRODUCTS}`);
      }
    }
  }, [form, id]);

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

  const columns = React.useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "sku",
        header: "SKU",
        meta: {
          className: "w-50",
        },
      },
      {
        accessorKey: "price",
      },
      {
        header: "Inventory",
        accessorKey: "Inventory.quantity",
      },
      {
        header: "Re-order Level",
        accessorKey: "reorderLevel",
      },
      ...variants.map((variant, idx) => ({
        accessorKey: "values.values." + variant.name,
        header: variant.name,
        cell: ({ row }) => {
          return row.original.values[idx]?.value;
        },
      })),
    ],
    [variants],
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
              <CardTitle>Product Details</CardTitle>
              <CardAction>
                <div className="flex gap-2">
                  <div className="ml-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="size-8"
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
                <Button variant="secondary" className="shadow-lg" type="submit">
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
                  variant="secondary"
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
                    <Badge variant="outline" key={idx}>
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
                  variant="secondary"
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
          onClose={() => {
            handleToggle({ cloneModal: false });
          }}
          productId={Number(id)}
        />
      )}
    </Fragment>
  );
}
