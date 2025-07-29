import React from "react";

import {
  inventoryServices,
  type APIResponse,
  type Inventory,
} from "@/services";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { PAGINATION, ROUTES } from "@/utils/definitions";
import { PackageOpen, Pencil } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
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

export default function Inventory() {
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
      const { data }: { data: APIResponse<Inventory[]> } =
        await inventoryServices.list();

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
      accessorKey: "product.reorderLevel",
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
            "text-red-500":
              row.original.quantity <= row.original.product.reorderLevel,
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
          <ItemList data={data || []} columns={columns} />
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
