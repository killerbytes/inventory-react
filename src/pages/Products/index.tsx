import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { APIResponse, CategorizedProductList, Product } from "@/types";
import { categoryServices, productServices } from "@/services";
import { Button } from "@/components/ui/button";
import NewPackageModal from "./NewPackageModal";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import { Plus, PlusIcon } from "lucide-react";
import { useCategoryStore } from "@/stores";
import useToggle from "@/hooks/useToggle";
import Select from "@/components/Select";
import ProductList from "./ProductList";
import ProductItem from "./ProductItem";
import React, { Fragment } from "react";
import EditModal from "./EditModal";
import AddModal from "./AddModal";

export default function Products() {
  const [category, setCategory] = React.useState<number>();
  const { categories, setCategories } = useCategoryStore();
  const [query, setQuery] = React.useState("");
  const [data, setData] = React.useState<APIResponse<CategorizedProductList[]>>(
    {
      data: [],
      total: 0,
      totalPages: 0,
      currentPage: 0,
    },
  );
  const [selected, setSelected] = React.useState<Product | null>();
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState({
    q: "",
    categoryId: "ALL",
  });
  const [toggle, handleToggle] = useToggle({
    addModal: false,
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
      const res = await productServices.getAll({
        ...filter,
        ...(filter.categoryId === "ALL" && { categoryId: null }),
      });
      setData(res);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const handleNewPackage = async () => {
    handleToggle({ newPackageModal: false });
    getData();
  };
  React.useEffect(() => {
    getData();
  }, [filter, getData]);

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
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear mb-4">
        <div className="flex w-full items-center px-2">
          <h1 className="scroll-m-20 font-semibold tracking-tight">Products</h1>
          <div className="ml-auto">
            <Button
              onClick={() => {
                handleToggle({ addModal: true });
              }}
            >
              <Plus /> Add Product
            </Button>
          </div>
        </div>
      </header>
      <div className="flex gap-2 justify-between">
        <Input
          placeholder="Search products"
          className="w-full mb-4"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />
        <Select
          value={filter.categoryId}
          options={[{ id: "ALL", name: "ALL" }, ...categories]}
          className="w-full mb-4"
          labelKey="name"
          valueKey="id"
          onChange={(e) => {
            const categoryId = (e.target as HTMLInputElement).value;
            setFilter({
              ...filter,
              categoryId,
            });
          }}
        />
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Accordion
            type="multiple"
            className="w-full"
            defaultValue={data.data?.map((item) => item.categoryId)}
          >
            {data.data?.map((item) => (
              <AccordionItem value={item.categoryId} key={item.categoryId}>
                <AccordionTrigger className="bg-accent px-2 rounded-none border py-2">
                  {item.categoryName}
                </AccordionTrigger>
                <AccordionContent className="flex flex-col">
                  {item.products.map((product) => (
                    <Fragment key={product.id}>
                      <ProductItem
                        product={product}
                        onSelect={setSelected}
                        onToggle={handleToggle}
                      />
                      {product?.subProducts?.map((subItem: Product) => {
                        return (
                          <Fragment key={subItem.id}>
                            <ProductItem
                              product={subItem}
                              sub={true}
                              onSelect={setSelected}
                              onToggle={handleToggle}
                            />
                          </Fragment>
                        );
                      })}
                    </Fragment>
                  ))}

                  <div className="flex justify-start  py-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => {
                        setCategory(Number(item.categoryId));
                        handleToggle({ addModal: true });
                      }}
                    >
                      <PlusIcon />
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </>
      )}

      {toggle.addModal && (
        <AddModal
          isOpen={true}
          categoryId={category}
          onClose={() => {
            handleToggle({ addModal: false });
          }}
          onSubmit={() => {
            handleToggle({ addModal: false });
            getData();
          }}
        />
      )}

      {toggle.editModal && (
        <EditModal
          isOpen={true}
          onClose={() => {
            handleToggle({ editModal: false });
          }}
          onSubmit={() => {
            handleToggle({ editModal: false });
            getData();
          }}
          data={selected as Product}
        />
      )}
      {toggle.newPackageModal && (
        <NewPackageModal
          isOpen={true}
          onClose={() => {
            handleToggle({ newPackageModal: false });
          }}
          onSubmit={handleNewPackage}
          data={selected as Product}
        />
      )}
    </div>
  );
}
