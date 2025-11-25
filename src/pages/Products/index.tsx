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
import ProductComboSearchCommand from "@/components/ProductComboSearchCommand";
import { categoryServices, productCombinationServices } from "@/services";
import GroupedCommandList from "@/components/GroupedCommandList";
import { GLOBAL_COLOR, ROUTES } from "@/utils/definitions";
import { CategorizedProductList, Product } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import CreateProductModal from "./CreateProductModal";
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
import ProductItem from "./ProductItem";
import React, { Fragment } from "react";
import { useStore } from "@/stores";

interface filterProps {
  q?: string;
  categoryId?: string;
}

export default function Products() {
  const navigate = useNavigate();
  const {
    categoryState: { hasLoaded: categoryHasLoaded, categories, setCategories },
  } = useStore();
  const {
    productCombinationState: {
      productCombinationsHasLoaded,
      productCombinations,
      setProductsCombinations,
    },
  } = useStore();
  const [query, setQuery] = React.useState("");
  const [data, setData] = React.useState<CategorizedProductList[]>([]);
  const [loading, setLoading] = React.useState(false);
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

  React.useEffect(() => {
    if (categories.length > 0 && productCombinations.length > 0) {
      const productMap = new Map<number, Product>();
      productCombinations.forEach((item) => {
        const productId = item.product.id ?? 0;
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            id: productId,
            ...item.product,
            combinations: [],
          });
        }
        const product = productMap.get(productId);
        product!.combinations?.push(item);
      });

      const categorizedProductList = categories.map((category) => {
        return {
          categoryId: category.id ?? 0,
          categoryName: category.name,
          categoryOrder: category.order,
          products: Array.from(productMap.values()).filter(
            (product) => product.categoryId === category.id,
          ),
        };
      });

      setData(categorizedProductList);
    }
  }, [categories, productCombinations]);

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
      setLoading(true);
      try {
        const data = await productCombinationServices.list();
        setProductsCombinations(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
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
            <Loader />
          ) : (
            data.length > 0 && (
              <Accordion
                type="multiple"
                className="w-full"
                xxxdefaultValue={data
                  ?.filter((i) => i.products.length > 0)
                  .map((i) => i.categoryId)}
              >
                {data?.map((item) => (
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
                        {item.subCategories?.map((i) => (
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
            )
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
