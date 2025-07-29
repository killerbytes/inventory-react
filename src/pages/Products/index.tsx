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

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Product",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "category.name",
      header: "Category",
      meta: { className: "w-20" },
    },
    {
      accessorKey: "reorderLevel",
      header: () => <div className="text-right">Reorder Level</div>,
      meta: { className: "text-right w-10" },
    },
    {
      accessorKey: "unit",
      header: "Unit",
      meta: { className: "w-10" },
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Actions</div>,
      meta: {
        className: "w-10",
      },
      cell: ({ row }) => {
        return (
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => {
                setSelected(row.original);
                handleToggle({ editModal: true });
              }}
            >
              <Pencil />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => {
                setSelected(row.original);
                handleToggle({ newPackageModal: true });
              }}
            >
              <PackageOpen />
            </Button>
          </div>
        );
      },
    },
  ];

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
                <AccordionTrigger>{item.categoryName}</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance">
                  {/* <DataTable data={item.products || []} columns={columns} /> */}
                  <ProductList products={item.products} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* <DataTable
            data={data?.data || []}
            columns={columns}
            className="mb-8"
          /> */}

          {/* <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    onClick={() => requestSort(column.key)}
                    style={{ cursor: "pointer" }}
                    title={column.title}
                    className={column.className}
                  >
                    {column.title}
                    {filter.sort === column.key && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {filter.order === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((item) => (
                <TableRow key={item.id} className="group md:hover:bg-slate-100">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.category.name}</TableCell>
                  <TableCell className="text-right">
                    {item.reorderLevel}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      className="group-hover:opacity-100 md:opacity-0"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelected(item);
                        handleToggle({ editModal: true });
                      }}
                    >
                      <Pencil size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table> */}
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
