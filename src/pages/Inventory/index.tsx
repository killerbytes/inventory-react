import React, { Fragment } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { PackageOpen, Pencil, PlusIcon } from "lucide-react";
import { PAGINATION, ROUTES } from "@/utils/definitions";
import ProductItem from "../Products/ProductItem";
import { ColumnDef } from "@tanstack/react-table";
import { APIResponse, Inventory } from "@/types";
import { Button } from "@/components/ui/button";
import { inventoryServices } from "@/services";
import { cx } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import useToggle from "@/hooks/useToggle";
import PackageModal from "./PackageModal";
import { Link } from "react-router";
import EditModal from "./EditModal";
import ItemList from "./ItemList";

interface ItemList {
  categoryId: string;
  categoryName: string;
  inventories: Inventory[];
}

export default function InventoryList() {
  const [selected, setSelected] = React.useState<Inventory | null>();
  const [data, setData] = React.useState<APIResponse<Inventory[]>>({
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: 0,
  });

  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState({
    limit: PAGINATION.PAGE_SIZE,
    page: PAGINATION.PAGE,
    sort: "product.name",
    order: "asc",
    q: "",
  });
  const [toggle, handleToggle] = useToggle({
    editModal: false,
    packageModal: false,
  });
  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data: APIResponse<Inventory[]> = await inventoryServices.list();
      setData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    getData();
  }, [filter, getData]);

  const columns: ColumnDef<Inventory>[] = [
    {
      accessorKey: "product.name",
      header: "Product",
    },
    {
      accessorKey: "product.description",
      header: "Description",
    },
    {
      accessorKey: "reorderLevel",
      header: () => <div className="text-right">Reorder Level</div>,
      meta: { className: "text-right" },
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-right">Quantity</div>,
      meta: {
        className: "text-right",
      },
      cell: ({ row }) => (
        <div
          className={cx({
            "text-red-500": row.original.quantity <= row.original.reorderLevel,
          })}
        >
          {row.getValue("quantity")}
        </div>
      ),
    },
    {
      accessorKey: "product.unit",
      header: "Unit",
    },
    {
      accessorKey: "price",
      header: () => <div className="text-right">Price</div>,
      meta: { className: cx("text-right") },
      cell: ({ row }) => (
        <span
          className={cx({
            "text-red-500 font-semibold":
              parseFloat(row.getValue("price")) <= 0,
          })}
        >
          {formatCurrency(row.getValue("price"))}
        </span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: () => <div className="text-right">Updated At</div>,
      meta: { className: "text-right" },
      cell: ({ row }) => formatDate(row.getValue("updatedAt")),
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Actions</div>,
      meta: {
        className: "justify-end flex gap-2",
      },
      cell: ({ row }) => {
        return (
          <>
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
                handleToggle({ packageModal: true });
              }}
            >
              <PackageOpen />
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <div>
      <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear mb-4">
        <div className="flex w-full items-center px-2">
          <h1 className="font-medium">Inventory</h1>
        </div>
        <Link to={ROUTES.INVENTORY_TRANSACTIONS}>
          <Button variant="outline">History</Button>
        </Link>
      </header>
      <div>
        <Input
          placeholder="Search inventory"
          className="w-full mb-4"
          value={filter.q}
          onChange={(e) => {
            setFilter((prev) => ({
              ...prev,
              q: e.target.value,
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
            defaultValue={data?.map((item) => item.categoryId)}
          >
            {data?.map((category) => (
              <AccordionItem
                value={category.categoryId}
                key={category.categoryId}
              >
                <AccordionTrigger className="bg-accent px-2 rounded-none border py-2">
                  {category.categoryName}
                </AccordionTrigger>
                <AccordionContent className="flex flex-col">
                  {category.inventories.map(({ id, product }) => (
                    <Fragment key={id}>
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
                        setCategory(Number(category.categoryId));
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

          {/* <ItemList data={data || []} columns={columns} /> */}
        </>
      )}

      {toggle.editModal && (
        <EditModal
          isOpen={true}
          onClose={() => {
            handleToggle({ editModal: false });
          }}
          cb={getData}
          data={selected as Inventory}
        />
      )}
      {toggle.packageModal && (
        <PackageModal
          isOpen={true}
          onClose={() => {
            handleToggle({ packageModal: false });
          }}
          cb={getData}
          data={selected}
        />
      )}
    </div>
  );
}
