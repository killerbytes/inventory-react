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
import {
  categoryServices,
  productCombinationServices,
  productServices,
} from "@/services";
import ProductComboSearchCommand from "@/components/ProductComboSearchCommand";
import { CategorizedProductList, PaginatedResponse, Product } from "@/types";
import { useCategoryStore, useProductCombinationStore } from "@/stores";
import { GLOBAL_COLOR, ROUTES, UNIT_COLOR } from "@/utils/definitions";
import { CommandGroup, CommandItem } from "@/components/ui/command";
import { formatCurrency, getScore } from "@/utils/formatters";
import { Card, CardContent } from "@/components/ui/card";
import CreateProductModal from "./CreateProductModal";
import { SelectItem } from "@/components/ui/select";
import ColorBadge from "@/components/ColorBadge";
import { Button } from "@/components/ui/button";
import { PlusIcon, Search } from "lucide-react";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import { useNavigate } from "react-router";
import useToggle from "@/hooks/useToggle";
import Select from "@/components/Select";
import ProductItem from "./ProductItem";
import React, { Fragment } from "react";

interface filterProps {
  q?: string;
  categoryId?: string;
}

export default function Products() {
  const navigate = useNavigate();
  const {
    hasLoaded: categoryHasLoaded,
    categories,
    setCategories,
  } = useCategoryStore();
  const {
    hasLoaded: productCombinationsHasLoaded,
    productCombinations,
    setProductsCombinations,
  } = useProductCombinationStore();
  const [query, setQuery] = React.useState("");
  const [data, setData] = React.useState<
    PaginatedResponse<CategorizedProductList[]>
  >({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });
  const [loading, setLoading] = React.useState(true);
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

  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      if (!filter.q) {
        delete filter.q;
      }
      const data = await productServices.getAll({
        ...filter,
        ...(filter.categoryId === "ALL" && { categoryId: null }),
      });
      console.log(data);
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
    const getData = async () => {
      const res = await categoryServices.list();
      setCategories(res);
    };
    if (!categoryHasLoaded) {
      getData();
    }
  }, [categoryHasLoaded, setCategories]);

  React.useEffect(() => {
    const getData = async () => {
      const data = await productCombinationServices.list();
      setProductsCombinations(data);
    };
    if (!productCombinationsHasLoaded) {
      getData();
    }
  }, [productCombinationsHasLoaded, setProductsCombinations]);

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
            items={productCombinations}
            onSelect={(item) => {
              navigate(`${ROUTES.PRODUCTS}/${item.productId}`);
            }}
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
                options={[{ id: "ALL", name: "ALL" }, ...categories]}
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
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Accordion
              type="multiple"
              className="w-full"
              // defaultValue={data.data?.map((item) => item.categoryId)}
              defaultValue={data?.data
                ?.filter((i) => i.products.length > 0)
                .map((i) => i.categoryId)}
            >
              {data?.data?.map((item) => (
                <AccordionItem value={item.categoryId} key={item.categoryId}>
                  <AccordionTrigger
                    className={cx(
                      "uppercase text-right",
                      GLOBAL_COLOR.CATEGORY,
                    )}
                  >
                    {item.categoryName}

                    {/* <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategory(Number(item.categoryId));
                        handleToggle({ createProductModal: true });
                      }}
                    >
                      <PlusIcon />
                    </div> */}
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col">
                    <>
                      {item.products.map((product) => (
                        <Fragment key={product.id}>
                          <ProductItem item={product} />
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
                      {item.subCategories.map((i) => (
                        <Fragment key={i.id}>
                          <div className="flex gap-2 justify-start items-center">
                            {i.categoryName}
                            {/* <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => {
                                setCategory(Number(i.categoryId));
                                handleToggle({ createProductModal: true });
                              }}
                            >
                              <PlusIcon />
                            </Button> */}
                          </div>

                          <div className="flex gap-2 justify-start items-center">
                            {i.products.map((product: Product) => (
                              <ProductItem item={product} />
                            ))}
                          </div>
                        </Fragment>
                      ))}
                    </>

                    <div className="flex justify-start  py-1">
                      {/* <Button
                        variant="outline"
                        size="icon"
                        className="size-8 shadow-sm"
                        onClick={() => {
                          setCategory(Number(item.categoryId));
                          handleToggle({ createProductModal: true });
                        }}
                      >
                        <PlusIcon />
                      </Button> */}
                      {/* {item.subCategories.map((i) => (
                        <Badge
                          onClick={() => {
                            setCategory(Number(i.id));
                            handleToggle({ createProductModal: true });
                          }}
                        >
                          {console.log(i)}
                          {i.subCategoryName}
                        </Badge>
                      ))} */}
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
