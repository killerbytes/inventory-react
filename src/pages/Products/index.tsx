import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { productServices, type APIResponse, type Product } from "@/services";
import { PackageOpen, Pencil, Plus } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { PAGINATION } from "@/utils/definitions";
import { Button } from "@/components/ui/button";
import NewPackageModal from "./NewPackageModal";
import { Input } from "@/components/ui/input";
import useToggle from "@/hooks/useToggle";
import ProductList from "./ProductList";
import EditModal from "./EditModal";
import AddModal from "./AddModal";
import React from "react";

export interface CategorizedProductList {
  categoryId: string;
  categoryName: string;
  products: Product[];
}

export default function Products() {
  const [page, setPage] = React.useState(1);
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
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "categoryId",
    order: "asc",
    q: "",
  });
  const [toggle, handleToggle] = useToggle({
    addModal: false,
    editModal: false,
    newPackageModal: false,
  });

  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data }: { data: APIResponse<CategorizedProductList[]> } =
        await productServices.list();
      setData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleNewPackage = async () => {
    handleToggle({ newPackageModal: false });
    getData();
  };
  React.useEffect(() => {
    getData();
  }, [filter, getData]);

  React.useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      page,
    }));
  }, [page]);

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
      <div>
        <Input
          placeholder="Search products"
          className="w-full mb-4"
          value={filter.q}
          onChange={(e) => {
            setFilter((prev) => ({
              ...prev,
              q: e.target.value,
              page: 1,
            }));
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
            defaultValue={data.map((item) => item.categoryId)}
          >
            {data.map((item) => (
              <AccordionItem value={item.categoryId}>
                <AccordionTrigger className="text-accent-foreground ">
                  {" "}
                  {item.categoryName}
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance">
                  <ProductList
                    products={item.products}
                    onSelect={setSelected}
                    onToggle={handleToggle}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </>
      )}

      {toggle.addModal && (
        <AddModal
          isOpen={true}
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
