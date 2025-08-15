import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategorizedProductList, PaginatedResponse, Product } from "@/types";
import { categoryServices, productServices } from "@/services";
import { SidebarTrigger } from "@/components/ui/sidebar";
import CreateProductModal from "./CreateProductModal";
import { SelectItem } from "@/components/ui/select";
import { GLOBAL_COLOR } from "@/utils/definitions";
import { Button } from "@/components/ui/button";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import { useCategoryStore } from "@/stores";
import useToggle from "@/hooks/useToggle";
import Select from "@/components/Select";
import ProductItem from "./ProductItem";
import { PlusIcon } from "lucide-react";
import React, { Fragment } from "react";

export default function Products() {
  const [category, setCategory] = React.useState<number>();
  const { categories, setCategories } = useCategoryStore();
  const [query, setQuery] = React.useState("");
  const [data, setData] = React.useState<
    PaginatedResponse<CategorizedProductList[]>
  >({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });
  const [selected, setSelected] = React.useState<Product | null>();
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState({
    q: "",
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

  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await productServices.getAll({
        ...filter,
        ...(filter.categoryId === "ALL" && { categoryId: null }),
      });
      setData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  React.useEffect(() => {
    if (categories?.length === 0) {
      const getData = async () => {
        const res = await categoryServices.list();
        setCategories(res);
      };
      getData();
    }
  }, [categories, setCategories]);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="bg-border h-5 w-[1px]"></div>
            Products
          </CardTitle>
        </CardHeader>
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
                options={[{ id: "ALL", name: "ALL" }, ...categories]}
                className="w-full mb-4"
                onChange={(e) => {
                  const categoryId = (e.target as HTMLInputElement).value;
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
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Accordion
              type="multiple"
              className="w-full"
              // defaultValue={data.data?.map((item) => item.categoryId)}
              defaultValue={[1]}
            >
              {data.data?.map((item) => (
                <AccordionItem value={item.categoryId} key={item.categoryId}>
                  <AccordionTrigger
                    className={cx(
                      "uppercase text-right",
                      GLOBAL_COLOR.CATEGORY,
                    )}
                  >
                    {item.categoryName}
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col">
                    {item.products.map((product) => (
                      <Fragment key={product.id}>
                        <ProductItem
                          item={product}
                          onSelect={setSelected}
                          onToggle={handleToggle}
                        />
                        {/* 
                        {product.combinations?.map((combination: Product) => {
                          return (
                            <Fragment key={combination.id}>
                              <CombinationItem
                                item={combination}
                                product={product}
                                sub={true}
                                onSelect={setSelected}
                                onToggle={handleToggle}
                              />
                            </Fragment>
                          );
                        })} */}
                      </Fragment>
                    ))}

                    <div className="flex justify-start  py-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8 shadow-sm"
                        onClick={() => {
                          setCategory(Number(item.categoryId));
                          handleToggle({ createProductModal: true });
                        }}
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {toggle.createProductModal && (
        <CreateProductModal
          categoryId={category}
          isOpen={true}
          onClose={() => {
            handleToggle({ createProductModal: false });
          }}
        />
      )}
    </div>
  );
}
