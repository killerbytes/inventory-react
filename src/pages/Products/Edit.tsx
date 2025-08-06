import {
  ApiError,
  ApiErrorResponse,
  Product,
  ProductCombinations,
  VariantTypes,
} from "@/types";
import { categoryServices, productServices } from "@/services";
import { useNavigate, useParams } from "react-router";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import CombinationModal from "./CombinationModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getErrorMessage } from "@/lib/utils";
import { ROUTES } from "@/utils/definitions";
import { Form } from "@/components/ui/form";
import VariantsModal from "./VariantsModal";
import { useCategoryStore } from "@/stores";
import useToggle from "@/hooks/useToggle";
import { useForm } from "react-hook-form";
import ProductForm from "./ProductForm";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import React from "react";

export default function ProductEdit() {
  const { id } = useParams();
  const { categories, setCategories } = useCategoryStore();
  const [combinations, setCombinations] = React.useState<ProductCombinations[]>(
    [],
  );
  const [variants, setVariants] = React.useState<VariantTypes[]>([]);
  const navigate = useNavigate();
  const form = useForm<Product>({
    defaultValues: {
      name: "",
    },
  });
  const [toggle, handleToggle] = useToggle({
    variantModal: false,
    combinationModal: false,
  });

  async function onSubmit(values: Product) {
    try {
      // const { variants, combinations, ...rest } = values;
      // const payload = {
      //   ...rest,
      //   variants: variants.map((i) => {
      //     return {
      //       id: i.id,
      //       name: i.name,
      //       productId: i.productId,
      //       values: i.values.map((v) => {
      //         return v.value;
      //       }),
      //     };
      //   }),
      //   combinations: combinations.map((i) => {
      //     return {
      //       id: i.id,
      //       sku: i.sku,
      //       price: i.price,
      //       inventory: i.inventory,
      //       values: Object.fromEntries(
      //         i.values.map((i) => [
      //           variants.find((v) => v.id === i.variantTypeId)?.name,
      //           i.value,
      //         ]),
      //       ),
      //     };
      //   }),
      // };
      await productServices.update(String(id), values);
      getData();
    } catch (error) {
      console.log(error);
      const { errors, message } = getErrorMessage(error as ApiErrorResponse);
      errors?.forEach((err: ApiError) => {
        if (err.field) {
          form.setError(err.field as keyof Product, err.message);
        }
      });
      toast.error("Submission failed: " + message);
    }
  }

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
        accessorKey: "Inventory.quantity",
      },
      ...variants.map((variant, idx) => ({
        accessorKey: "values.values." + variant.name,
        header: variant.name,
        cell: ({ row }) => {
          return row.original.values[idx].value;
        },
      })),
    ],
    [variants],
  );
  console.log(combinations);
  return (
    <>
      <Form {...form}>
        <form
          className="h-full flex flex-col"
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
          <ProductForm
            form={form}
            onSubmit={onSubmit}
            categories={categories}
          />
          {/* <div className="flex mb-4 gap-2">

           
          </div> */}

          <div className="flex flex-wrap gap-2 mb-4">
            {variants.map((variant, idx) => {
              return (
                <Badge variant="outline" key={idx}>
                  {variant.name}
                </Badge>
              );
            })}
            <Button
              onClick={() => handleToggle({ variantModal: true })}
              type="button"
              variant="secondary"
            >
              <Pencil />
              Edit Variants
            </Button>
          </div>

          <DataTable
            data={combinations || []}
            columns={columns}
            className="mb-4"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => handleToggle({ combinationModal: true })}
              type="button"
              variant="secondary"
            >
              <Pencil />
              Edit Combinations
            </Button>
          </div>

          <div className="flex justify-end mt-auto mb-8">
            <Button type="submit">Save changes</Button>
          </div>
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
    </>
  );
}
