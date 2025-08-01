import React, { Fragment } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { categoryServices, inventoryServices } from "@/services";
import { CategorizedInventoryList, Inventory } from "@/types";
import { PAGINATION, ROUTES } from "@/utils/definitions";
import { Button } from "@/components/ui/button";
import NewPackageModal from "./NewPackageModal";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/useDebounce";
import InventoryItem from "./InventoryItem";
import { useCategoryStore } from "@/stores";
import useToggle from "@/hooks/useToggle";
import Select from "@/components/Select";
import { Link } from "react-router";
import EditModal from "./EditModal";

export default function InventoryList() {
  const { categories, setCategories } = useCategoryStore();
  const [selected, setSelected] = React.useState<Inventory | null>();
  const [data, setData] = React.useState<CategorizedInventoryList[]>([]);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState({
    // limit: PAGINATION.PAGE_SIZE,
    // page: PAGINATION.PAGE,
    // sort: "product.name",
    // order: "asc",
    q: "",
  });
  const [toggle, handleToggle] = useToggle({
    editModal: false,
    newPackageModal: false,
  });
  const getData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data: CategorizedInventoryList[] = await inventoryServices.getAll({
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

  const debouncedQuery = useDebounce(query, 500);
  React.useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      q: debouncedQuery,
    }));
  }, [debouncedQuery]);

  const handleNewPackage = async () => {
    handleToggle({ newPackageModal: false });
    getData();
  };

  // const columns: ColumnDef<Inventory>[] = [
  //   {
  //     accessorKey: "product.name",
  //     header: "Product",
  //   },
  //   {
  //     accessorKey: "product.description",
  //     header: "Description",
  //   },
  //   {
  //     accessorKey: "reorderLevel",
  //     header: () => <div className="text-right">Reorder Level</div>,
  //     meta: { className: "text-right" },
  //   },
  //   {
  //     accessorKey: "quantity",
  //     header: () => <div className="text-right">Quantity</div>,
  //     meta: {
  //       className: "text-right",
  //     },
  //     cell: ({ row }) => (
  //       <div
  //         className={cx({
  //           "text-red-500": row.original.quantity <= row.original.reorderLevel,
  //         })}
  //       >
  //         {row.getValue("quantity")}
  //       </div>
  //     ),
  //   },
  //   {
  //     accessorKey: "product.unit",
  //     header: "Unit",
  //   },
  //   {
  //     accessorKey: "price",
  //     header: () => <div className="text-right">Price</div>,
  //     meta: { className: cx("text-right") },
  //     cell: ({ row }) => (
  //       <span
  //         className={cx({
  //           "text-red-500 font-semibold":
  //             parseFloat(row.getValue("price")) <= 0,
  //         })}
  //       >
  //         {formatCurrency(row.getValue("price"))}
  //       </span>
  //     ),
  //   },
  //   {
  //     accessorKey: "updatedAt",
  //     header: () => <div className="text-right">Updated At</div>,
  //     meta: { className: "text-right" },
  //     cell: ({ row }) => formatDate(row.getValue("updatedAt")),
  //   },
  //   {
  //     accessorKey: "actions",
  //     header: () => <div className="text-center">Actions</div>,
  //     meta: {
  //       className: "justify-end flex gap-2",
  //     },
  //     cell: ({ row }) => {
  //       return (
  //         <>
  //           <Button
  //             variant="outline"
  //             size="icon"
  //             className="size-8"
  //             onClick={() => {
  //               setSelected(row.original);
  //               handleToggle({ editModal: true });
  //             }}
  //           >
  //             <Pencil />
  //           </Button>
  //           <Button
  //             variant="outline"
  //             size="icon"
  //             className="size-8"
  //             onClick={() => {
  //               setSelected(row.original);
  //               handleToggle({ packageModal: true });
  //             }}
  //           >
  //             <PackageOpen />
  //           </Button>
  //         </>
  //       );
  //     },
  //   },
  // ];

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
      </div>

      {/* <div>
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
      </div> */}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="flex justify-end gap-2 text-sm font-semibold py-2">
            <div className="w-15 text-right">Price</div>
            <div className="w-15 text-right">Quantity</div>
            <div className="w-20 text-center">Reorder Level</div>
            <div className="w-20"></div>
          </div>

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
                <AccordionContent className="flex flex-col border-b">
                  {category.inventories.map((inventory) => (
                    <Fragment key={inventory.id}>
                      <InventoryItem
                        inventory={inventory}
                        onSelect={setSelected}
                        onToggle={handleToggle}
                      />
                      {inventory.repacks.map((repack) => (
                        <InventoryItem
                          inventory={repack}
                          onSelect={setSelected}
                          onToggle={handleToggle}
                          sub
                        />
                      ))}
                    </Fragment>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
      {toggle.newPackageModal && (
        <NewPackageModal
          isOpen={true}
          onClose={() => {
            handleToggle({ newPackageModal: false });
          }}
          onSubmit={handleNewPackage}
          data={selected}
        />
      )}
    </div>
  );
}
