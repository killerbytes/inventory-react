import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product, ProductCombinations, VariantTypes } from "@/types";

import { SelectItem } from "@/components/ui/select";
import CombinationModal from "./CombinationModal";
import { Button } from "@/components/ui/button";
import SupplierHistory from "./SupplierHistory";
import { UseFormReturn } from "react-hook-form";
import ProductHistory from "./ProductHistory";
import useToggle from "@/hooks/useToggle";
import PriceHistory from "./PriceHistory";
import Combinations from "./Combinations";
import Select from "@/components/Select";
import { Pencil } from "lucide-react";
import React from "react";

const defaultOption = { id: -1, name: "ALL" };

export default function CombinationsTab({
  combinations,
  variants,
  getData,
  form,
}: {
  combinations: ProductCombinations[];
  variants: VariantTypes[];
  getData: () => void;
  form: UseFormReturn<Product>;
}) {
  const [activeTab, setActiveTab] = React.useState("combinations");
  const [selectedCombination, setSelectedCombination] = React.useState<string>(
    String(defaultOption.id),
  );
  const [toggle, handleToggle] = useToggle({
    combinationModal: false,
  });

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
    <>
      <CardHeader>
        <CardTitle>
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
              options={[{ id: -1, value: "ALL" }, ...breakPackFilter.values]}
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
        </CardTitle>
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full xsm:w-fit flex items-center justify-start flex-nowrap overflow-x-auto md:overflow-x-visible">
            <TabsTrigger value="combinations">Combinations</TabsTrigger>

            <TabsTrigger value="price_history">Price History</TabsTrigger>
            <TabsTrigger value="supplier_history">Supplier History</TabsTrigger>
            <TabsTrigger value="product_history">Product History</TabsTrigger>
          </TabsList>
          <TabsContent value="combinations">
            <Combinations
              combinations={combinations}
              variants={variants}
              getData={getData}
              selectedCombination={selectedCombo}
              isBreakPackFilter={!!breakPackFilter}
            />
          </TabsContent>
          <TabsContent value="price_history">
            <Card>
              <CardHeader>
                <CardTitle>Price History</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <PriceHistory
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
      </CardContent>
      {toggle.combinationModal && (
        <CombinationModal
          product={form.getValues()}
          isOpen={true}
          //   onSubmit={onSubmit}
          //   onClose={(shouldReload) => {
          //     if (shouldReload) {
          //       getData();
          //       productCombinationState.invalidate();
          //     }
          //     handleToggle({ combinationModal: false });
          //     setActiveTab("product_combination");
          //   }}
        />
      )}
    </>
  );
}
