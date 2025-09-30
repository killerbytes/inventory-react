import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/PageHeader";
import {
  Copy,
  EllipsisVertical,
  PackageOpen,
  Pencil,
  PlusIcon,
  Save,
  Search,
} from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  categoryServices,
  productCombinationServices,
  productServices,
} from "@/services";
import {
  ApiErrorResponse,
  Product,
  ProductCombinations,
  VariantTypes,
} from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductComboSearchCommand from "@/components/ProductComboSearchCommand";
import StockAdjustmentModal from "@/components/modals/StockAdjustmentModal";
import { useCategoryStore, useProductCombinationStore } from "@/stores";
import { CommandGroup, CommandItem } from "@/components/ui/command";
import PriceHistoryTable from "@/pages/Products/PriceHistoryTable";
import BreakPackModal from "@/components/modals/BreakPackModal";
import { ERROR, ROUTES, UNIT_COLOR } from "@/utils/definitions";
import { formatCurrency, getScore } from "@/utils/formatters";
import { ColumnDef, Row } from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import CreateProductModal from "./CreateProductModal";
import { useNavigate, useParams } from "react-router";
import { DataTable } from "@/components/DataTable";
import CombinationModal from "./CombinationModal";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import { Form } from "@/components/ui/form";
import VariantsModal from "./VariantsModal";
import useToggle from "@/hooks/useToggle";
import { useForm } from "react-hook-form";
import { productSchema } from "@/schemas";
import ProductForm from "./ProductForm";
import React, { Fragment } from "react";
import { toast } from "sonner";

export default function ProductEdit() {
  const { id } = useParams();
  const {
    hasLoaded: categoryHasLoaded,
    categories,
    setCategories,
  } = useCategoryStore();
  const productCombinationStore = useProductCombinationStore();
  const [combinations, setCombinations] = React.useState<ProductCombinations[]>(
    [],
  );
  const [selected, setSelected] = React.useState<ProductCombinations | null>(
    null,
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
    breakPackModal: false,
    stockAdjustmentModal: false,
    createProductModal: false,
  });
  async function onSubmit(values: Product) {
    try {
      await productServices.update(Number(id), values);
      getData();
      productCombinationStore.invalidate();
      toast.success("Product updated successfully");
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

  React.useEffect(() => {
    const getData = async () => {
      if (!productCombinationStore.hasLoaded) {
        const data = await productCombinationServices.list();
        productCombinationStore.setProductsCombinations(data);
      }
    };
    getData();
  }, [productCombinationStore]);

  // const x = useWatch<Product>({
  //   control: form.control,
  // });

  const columns = React.useMemo<ColumnDef<ProductCombinations>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      ...variants.map((variant, idx) => ({
        accessorKey: "values.values." + variant.name,
        header: variant.name,
        cell: ({ row }: { row: Row<ProductCombinations> }) => {
          const x = row.original.values.findIndex(
            (i) => i.variantTypeId === variants[idx].id,
          );

          return row.original.values[x]?.value;
        },
      })),
      {
        accessorKey: "unit",
        header: "Unit",
        cell: ({ row }: { row: Row<ProductCombinations> }) => {
          return (
            <ColorBadge colorMap={UNIT_COLOR}>{row.original.unit}</ColorBadge>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: { row: Row<ProductCombinations> }) => {
          return (
            <div className={cx({ "text-red-500": row.original.price == 0 })}>
              {formatCurrency(row.original.price)}
            </div>
          );
        },
      },
      {
        accessorKey: "averagePrice",
        header: "Average Price",
        cell: ({ row }: { row: Row<ProductCombinations> }) => {
          return formatCurrency(Number(row.original.inventory.averagePrice));
        },
      },
      {
        header: "Quantity",
        accessorKey: "inventory.quantity",
        meta: {
          headerClassName: "text-right",
          className: "w-0 text-right",
        },
      },
      {
        accessorKey: "conversionFactor",
        header: "Conversion Factor",
        meta: {
          headerClassName: "text-right",
          className: "w-0 text-right",
        },
      },
      {
        header: "Re-order Level",
        accessorKey: "reorderLevel",
        meta: {
          headerClassName: "text-right",
          className: "w-0 text-right",
        },
      },
      {
        accessorKey: "stockAdjustment",
        header: "Stock Adjustment",
        meta: {
          className: "w-0",
        },
        cell: ({ row }: { row: Row<ProductCombinations> }) => (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shadow-sm"
              onClick={() => {
                setSelected(row.original);
                handleToggle({ stockAdjustmentModal: true });
              }}
            >
              <Pencil />
            </Button>
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
                setSelected(row.original);
                handleToggle({ breakPackModal: true });
              }}
            >
              <PackageOpen />
            </Button>
          </div>
        ),
      },
    ],
    [handleToggle, variants],
  );
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
            items={productCombinationStore.productCombinations}
            onSelect={(item) =>
              navigate(`${ROUTES.PRODUCTS}/${item.productId}`)
            }
            renderOptions={({ items, open, setOpen, onSelect, search }) => {
              return (
                open &&
                items
                  .map((item) => ({
                    item,
                    score: getScore(item.name, search),
                  }))
                  .filter(({ score }) => score > 0)
                  .sort((a, b) => b.score - a.score)
                  .map(({ item }) => (
                    <CommandGroup key={item.id}>
                      <CommandItem
                        value={String(item.name + item.unit)}
                        key={item.id}
                        onSelect={() => {
                          setOpen(false);
                          onSelect?.(item);
                        }}
                        className="flex items-center gap-2 "
                      >
                        <ColorBadge colorMap={UNIT_COLOR}>
                          {item.unit}
                        </ColorBadge>

                        {item.name}
                        <div className="flex gap-2 ml-auto">
                          <span>{formatCurrency(item.price)}</span>
                        </div>
                      </CommandItem>
                    </CommandGroup>
                  ))
              );
            }}
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

          <Tabs defaultValue="product_combination">
            <TabsList>
              <TabsTrigger value="product_combination">
                Product Combinations
              </TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="price_history">Price History</TabsTrigger>
            </TabsList>
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
                  <DataTable
                    data={combinations || []}
                    columns={columns}
                    meta={{
                      disabledRow: "isActive",
                    }}
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
                            <Badge
                              variant="secondary"
                              key={idx}
                              className="outline"
                            >
                              {variant.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="price_history">
              <Card>
                <CardHeader>
                  <CardTitle>Price History</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <PriceHistoryTable productId={id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>

      {/* {JSON.stringify(x)} */}
      {toggle.variantModal && (
        <VariantsModal
          productId={Number(id)}
          isOpen={true}
          onClose={(shouldOpenComboModal) => {
            handleToggle({ variantModal: false });
            getData();
            if (shouldOpenComboModal) {
              handleToggle({ combinationModal: true });
            }
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
            productCombinationStore.invalidate();
            handleToggle({ combinationModal: false });
          }}
        />
      )}

      {toggle.breakPackModal && ( // && selected
        <BreakPackModal
          isOpen={true}
          onClose={() => {
            handleToggle({ breakPackModal: false });
          }}
          combination={selected as ProductCombinations}
          onSubmit={async () => {
            getData();
            productCombinationStore.invalidate();
            handleToggle({ breakPackModal: false });
          }}
        />
      )}
      {toggle.stockAdjustmentModal && (
        <StockAdjustmentModal
          isOpen={true}
          onClose={() => {
            getData();
            handleToggle({ stockAdjustmentModal: false });
          }}
          combinationId={Number(selected?.id)}
          onSubmit={async () => {
            // handleToggle({ stockAdjustmentModal: false });
            // navigate(`${ROUTES.PRODUCTS}/${productId}`);
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
