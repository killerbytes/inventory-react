import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/PageHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import CreateProductModal from "../../features/products/components/CreateProductModal";
import ProductComboSearchCommand from "@/components/ProductComboSearchCommand";
import { getMappedSearchProductCombinations } from "@/lib/utils";
import { GLOBAL_COLOR, ROUTES } from "@/utils/definitions";
import { Card, CardContent } from "@/components/ui/card";
import { useCategories } from "@/hooks/useCategories";
import { SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusIcon, Search } from "lucide-react";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import { useNavigate } from "react-router";
import useToggle from "@/hooks/useToggle";
import Select from "@/components/Select";
import Loader from "@/components/Loader";
import React from "react";

interface filterProps {
  q?: string;
  categoryId?: string;
}

export default function Products() {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const navigate = useNavigate();
  const [query, setQuery] = React.useState("");
  // const [data, setData] = React.useState<CategorizedProductList[]>([]);
  const [filter, setFilter] = React.useState<filterProps>({
    categoryId: "ALL",
  });
  const [toggle, handleToggle] = useToggle({
    createProductModal: false,
    editModal: false,
    newPackageModal: false,
  });

  const debouncedQuery = useDebounce(query, 500);
  React.useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      q: debouncedQuery,
    }));
  }, [debouncedQuery]);

  // React.useEffect(() => {
  //   if (
  //     categories &&
  //     categories?.length > 0 &&
  //     productCombinationState.ProductCombination.length > 0
  //   ) {
  //     const productMap = new Map<number, ProductWithCombinations>();
  //     productCombinationState.ProductCombination.forEach((item) => {
  //       const productId = item.product.id;
  //       if (!productMap.has(productId)) {
  //         productMap.set(productId, {
  //           ...item.product,
  //           id: productId,
  //           combinations: [],
  //         });
  //       }
  //       const product = productMap.get(productId);
  //       product!.combinations?.push(item);
  //     });

  //     const categorizedProductList = categories?.map((category) => {
  //       return {
  //         categoryId: category.id ?? 0,
  //         categoryName: category.name,
  //         categoryOrder: category.order ?? 0,
  //         products: Array.from(productMap.values()).filter(
  //           (product) => product.categoryId === category.id,
  //         ),
  //       };
  //     });

  //     setData(categorizedProductList);
  //   }
  // }, [categories, productCombinationState.ProductCombination]);

  const onSearch = React.useCallback(async (search: string) => {
    return await getMappedSearchProductCombinations({ search });
  }, []);

  return (
    <>
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
            onSelect={(item) => {
              navigate(`${ROUTES.PRODUCTS}/${item.productId}`);
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

      <Card>
        <CardContent>
          <div className="flex gap-2">
            <div className="w-full">
              <div className="text-sm font-semibold mb-1">Search</div>

              <Input
                placeholder="Search products"
                className="w-full mb-4"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
              />
            </div>
            <div className="w-full">
              <div className="text-sm font-semibold mb-1">Category</div>
              <Select
                value={filter.categoryId}
                options={[{ id: "ALL", name: "ALL" }, ...(categories ?? [])]}
                className="w-full mb-4"
                onChange={(value) => {
                  const categoryId = value;
                  setFilter({
                    ...filter,
                    categoryId,
                  });
                }}
                renderOption={(option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {option.name}
                  </SelectItem>
                )}
              />
            </div>
          </div>
          {categoriesLoading ? (
            <Loader />
          ) : (
            <Accordion type="multiple" className="w-full">
              {categories &&
                categories.map((item) => (
                  <AccordionItem value={String(item.id)} key={item.id}>
                    <AccordionTrigger
                      className={cx(
                        "uppercase text-right",
                        GLOBAL_COLOR.CATEGORY,
                      )}
                    >
                      {item.name}
                    </AccordionTrigger>
                    <AccordionContent className="flex flex-col">
                      {/* <>
                        {item.products.map((product) => (
                          <Fragment key={product.id}>
                            <ProductItem item={product} />
                          </Fragment>
                        ))}
                      </> */}
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
      {toggle.createProductModal && (
        <CreateProductModal
          // categoryId={category}
          isOpen={true}
          onClose={() => {
            handleToggle({ createProductModal: false });
          }}
        />
      )}
    </>
  );
}
