import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectedCombination } from "./CombinationFilter";
import SupplierHistoryTab from "./SupplierHistoryTab";
import ProductHistoryTab from "./ProductHistoryTab";
import { ProductWithCombinations } from "@/schemas";
import PriceHistoryTab from "./PriceHistoryTab";
import CombinationsTab from "./CombinationsTab";
import React from "react";

export default function CombinationTab({
  id,
  product,
}: {
  product: ProductWithCombinations | undefined;
  id: string | undefined;
}) {
  const [activeTab, setActiveTab] = React.useState("product_combination");
  const [selectedCombination, setSelectedCombination] = React.useState<
    SelectedCombination | undefined
  >(undefined);

  React.useEffect(() => {
    setSelectedCombination(undefined);
  }, [id]);

  const uniqueCombinations = React.useMemo(() => {
    return (
      product?.combinations?.filter(
        (item, index) =>
          product.combinations?.findIndex((i) => i.name === item.name) ===
          index,
      ) || []
    );
  }, [product]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="w-full xsm:w-fit flex items-center justify-start flex-nowrap overflow-x-auto md:overflow-x-visible">
        <TabsTrigger value="product_combination">
          Product Combinations
        </TabsTrigger>
        <TabsTrigger value="price_history">Price History</TabsTrigger>
        <TabsTrigger value="supplier_history">Supplier History</TabsTrigger>
        <TabsTrigger value="product_history">Product History</TabsTrigger>
      </TabsList>

      <TabsContent value="product_combination">
        {product && <CombinationsTab product={product} />}
      </TabsContent>
      <TabsContent value="price_history">
        <Card>
          <CardHeader className="items-center justify-between flex">
            <CardTitle>Price History</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <PriceHistoryTab
              productId={id ?? ""}
              selectedCombination={selectedCombination}
              setSelectedCombination={setSelectedCombination}
              uniqueCombinations={uniqueCombinations}
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
              setSelectedCombination={setSelectedCombination}
              uniqueCombinations={uniqueCombinations}
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
            <ProductHistoryTab
              selectedCombination={selectedCombination}
              combinations={product?.combinations || []}
              setSelectedCombination={setSelectedCombination}
              uniqueCombinations={uniqueCombinations}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
